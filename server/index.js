const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configurar banco de dados
const db = new sqlite3.Database('./financas.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('✅ Conectado ao banco de dados SQLite');
    inicializarBancoDeDados();
  }
});

// Criar tabelas se não existirem
function inicializarBancoDeDados() {
  // Criar tabela de transações
  db.run(`
    CREATE TABLE IF NOT EXISTS transacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL,
      categoria TEXT NOT NULL,
      valor REAL NOT NULL,
      descricao TEXT,
      data TEXT NOT NULL,
      subcategoria_id INTEGER,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Erro ao criar tabela transacoes:', err);
    } else {
      console.log('✅ Tabela de transações criada/verificada');
      // Adicionar coluna subcategoria_id se não existir
      db.run(`ALTER TABLE transacoes ADD COLUMN subcategoria_id INTEGER`, (err) => {
        // Ignorar erro se a coluna já existir
        if (err && !err.message.includes('duplicate column')) {
          console.error('Erro ao adicionar coluna subcategoria_id:', err);
        }
      });
    }
  });

  // Criar tabela de categorias
  db.run(`
    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Erro ao criar tabela categorias:', err);
    } else {
      console.log('✅ Tabela de categorias criada/verificada');
      inserirCategoriasPadrao();
    }
  });

  // Criar tabela de subcategorias
  db.run(`
    CREATE TABLE IF NOT EXISTS subcategorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoria_id INTEGER NOT NULL,
      nome TEXT NOT NULL,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('Erro ao criar tabela subcategorias:', err);
    } else {
      console.log('✅ Tabela de subcategorias criada/verificada');
    }
  });
}

// Inserir categorias padrão
function inserirCategoriasPadrao() {
  const categoriasReceita = [
    'Salário', 'Freelance', 'Investimentos', 'Vendas', 'Presente', 'Reembolso', 'Outros'
  ];
  
  const categoriasDespesa = [
    'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Compras', 'Contas', 'Impostos', 'Outros'
  ];

  // Verificar se já existem categorias
  db.get('SELECT COUNT(*) as count FROM categorias', [], (err, row) => {
    if (err) {
      console.error('Erro ao verificar categorias:', err);
      return;
    }

    if (row.count === 0) {
      // Inserir categorias de receita
      categoriasReceita.forEach((nome) => {
        db.run('INSERT INTO categorias (nome, tipo) VALUES (?, ?)', [nome, 'receita'], (err) => {
          if (err) {
            console.error(`Erro ao inserir categoria ${nome}:`, err);
          }
        });
      });

      // Inserir categorias de despesa
      categoriasDespesa.forEach((nome) => {
        db.run('INSERT INTO categorias (nome, tipo) VALUES (?, ?)', [nome, 'despesa'], (err) => {
          if (err) {
            console.error(`Erro ao inserir categoria ${nome}:`, err);
          }
        });
      });

      console.log('✅ Categorias padrão inseridas');
    }
  });
}

// ROTAS DA API

// Listar todas as transações
app.get('/api/transacoes', (req, res) => {
  const { mes, ano } = req.query;
  
  let query = 'SELECT * FROM transacoes';
  const params = [];
  
  if (mes && ano) {
    query += ` WHERE strftime('%m', data) = ? AND strftime('%Y', data) = ?`;
    params.push(mes.padStart(2, '0'), ano);
  }
  
  query += ' ORDER BY data DESC, criado_em DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ erro: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Obter uma transação específica
app.get('/api/transacoes/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM transacoes WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ erro: err.message });
    } else if (!row) {
      res.status(404).json({ erro: 'Transação não encontrada' });
    } else {
      res.json(row);
    }
  });
});

// Criar nova transação
app.post('/api/transacoes', (req, res) => {
  const { tipo, categoria, valor, descricao, data } = req.body;
  
  if (!tipo || !categoria || !valor || !data) {
    return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
  }
  
  if (tipo !== 'receita' && tipo !== 'despesa') {
    return res.status(400).json({ erro: 'Tipo deve ser "receita" ou "despesa"' });
  }
  
  const query = `
    INSERT INTO transacoes (tipo, categoria, valor, descricao, data)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.run(query, [tipo, categoria, valor, descricao, data], function(err) {
    if (err) {
      res.status(500).json({ erro: err.message });
    } else {
      res.status(201).json({ 
        id: this.lastID,
        mensagem: 'Transação criada com sucesso' 
      });
    }
  });
});

// Atualizar transação
app.put('/api/transacoes/:id', (req, res) => {
  const { id } = req.params;
  const { tipo, categoria, valor, descricao, data } = req.body;
  
  if (!tipo || !categoria || !valor || !data) {
    return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
  }
  
  const query = `
    UPDATE transacoes 
    SET tipo = ?, categoria = ?, valor = ?, descricao = ?, data = ?
    WHERE id = ?
  `;
  
  db.run(query, [tipo, categoria, valor, descricao, data, id], function(err) {
    if (err) {
      res.status(500).json({ erro: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ erro: 'Transação não encontrada' });
    } else {
      res.json({ mensagem: 'Transação atualizada com sucesso' });
    }
  });
});

// Deletar transação
app.delete('/api/transacoes/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM transacoes WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ erro: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ erro: 'Transação não encontrada' });
    } else {
      res.json({ mensagem: 'Transação deletada com sucesso' });
    }
  });
});

// Obter estatísticas
app.get('/api/estatisticas', (req, res) => {
  const { mes, ano } = req.query;
  
  let whereClause = '';
  const params = [];
  
  if (mes && ano) {
    whereClause = `WHERE strftime('%m', data) = ? AND strftime('%Y', data) = ?`;
    params.push(mes.padStart(2, '0'), ano);
  }
  
  const query = `
    SELECT 
      tipo,
      SUM(valor) as total,
      COUNT(*) as quantidade
    FROM transacoes
    ${whereClause}
    GROUP BY tipo
  `;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ erro: err.message });
    } else {
      const estatisticas = {
        receitas: 0,
        despesas: 0,
        saldo: 0,
        quantidadeReceitas: 0,
        quantidadeDespesas: 0
      };
      
      rows.forEach(row => {
        if (row.tipo === 'receita') {
          estatisticas.receitas = row.total || 0;
          estatisticas.quantidadeReceitas = row.quantidade || 0;
        } else if (row.tipo === 'despesa') {
          estatisticas.despesas = row.total || 0;
          estatisticas.quantidadeDespesas = row.quantidade || 0;
        }
      });
      
      estatisticas.saldo = estatisticas.receitas - estatisticas.despesas;
      
      res.json(estatisticas);
    }
  });
});

// Obter estatísticas do mês anterior para comparação
app.get('/api/estatisticas/mes-anterior', (req, res) => {
  const { mes, ano } = req.query;
  
  if (!mes || !ano) {
    return res.status(400).json({ erro: 'Mês e ano são obrigatórios' });
  }

  // Calcular mês anterior
  const mesAtual = parseInt(mes);
  const anoAtual = parseInt(ano);
  let mesAnterior = mesAtual - 1;
  let anoAnterior = anoAtual;
  
  if (mesAnterior === 0) {
    mesAnterior = 12;
    anoAnterior = anoAtual - 1;
  }

  const whereClause = `WHERE strftime('%m', data) = ? AND strftime('%Y', data) = ?`;
  const params = [mesAnterior.toString().padStart(2, '0'), anoAnterior.toString()];

  const query = `
    SELECT 
      tipo,
      SUM(valor) as total,
      COUNT(*) as quantidade
    FROM transacoes
    ${whereClause}
    GROUP BY tipo
  `;

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ erro: err.message });
    } else {
      const estatisticas = {
        receitas: 0,
        despesas: 0,
        saldo: 0,
        quantidadeReceitas: 0,
        quantidadeDespesas: 0
      };
      
      rows.forEach(row => {
        if (row.tipo === 'receita') {
          estatisticas.receitas = row.total || 0;
          estatisticas.quantidadeReceitas = row.quantidade || 0;
        } else if (row.tipo === 'despesa') {
          estatisticas.despesas = row.total || 0;
          estatisticas.quantidadeDespesas = row.quantidade || 0;
        }
      });
      
      estatisticas.saldo = estatisticas.receitas - estatisticas.despesas;
      
      res.json(estatisticas);
    }
  });
});

// Obter estatísticas por categoria
app.get('/api/estatisticas/categorias', (req, res) => {
  const { mes, ano, tipo } = req.query;
  
  let whereClause = '';
  const params = [];
  
  if (mes && ano) {
    whereClause = `WHERE strftime('%m', data) = ? AND strftime('%Y', data) = ?`;
    params.push(mes.padStart(2, '0'), ano);
  }
  
  if (tipo) {
    whereClause += whereClause ? ' AND' : 'WHERE';
    whereClause += ' tipo = ?';
    params.push(tipo);
  }
  
  const query = `
    SELECT 
      categoria,
      tipo,
      SUM(valor) as total,
      COUNT(*) as quantidade
    FROM transacoes
    ${whereClause}
    GROUP BY categoria, tipo
    ORDER BY total DESC
  `;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ erro: err.message });
    } else {
      res.json(rows);
    }
  });
});

// ========== ENDPOINTS DE CATEGORIAS ==========

// Listar categorias
app.get('/api/categorias', (req, res) => {
  const { tipo } = req.query;
  
  let query = 'SELECT * FROM categorias';
  const params = [];
  
  if (tipo) {
    query += ' WHERE tipo = ?';
    params.push(tipo);
  }
  
  query += ' ORDER BY nome ASC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ erro: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Obter uma categoria específica
app.get('/api/categorias/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM categorias WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ erro: err.message });
    } else if (!row) {
      res.status(404).json({ erro: 'Categoria não encontrada' });
    } else {
      res.json(row);
    }
  });
});

// Criar categoria
app.post('/api/categorias', (req, res) => {
  const { nome, tipo } = req.body;
  
  if (!nome || !tipo) {
    return res.status(400).json({ erro: 'Nome e tipo são obrigatórios' });
  }
  
  if (tipo !== 'receita' && tipo !== 'despesa') {
    return res.status(400).json({ erro: 'Tipo deve ser "receita" ou "despesa"' });
  }
  
  db.run('INSERT INTO categorias (nome, tipo) VALUES (?, ?)', [nome, tipo], function(err) {
    if (err) {
      res.status(500).json({ erro: err.message });
    } else {
      res.status(201).json({ 
        id: this.lastID,
        nome,
        tipo,
        mensagem: 'Categoria criada com sucesso' 
      });
    }
  });
});

// Atualizar categoria
app.put('/api/categorias/:id', (req, res) => {
  const { id } = req.params;
  const { nome, tipo } = req.body;
  
  if (!nome || !tipo) {
    return res.status(400).json({ erro: 'Nome e tipo são obrigatórios' });
  }
  
  if (tipo !== 'receita' && tipo !== 'despesa') {
    return res.status(400).json({ erro: 'Tipo deve ser "receita" ou "despesa"' });
  }
  
  db.run('UPDATE categorias SET nome = ?, tipo = ? WHERE id = ?', [nome, tipo, id], function(err) {
    if (err) {
      res.status(500).json({ erro: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ erro: 'Categoria não encontrada' });
    } else {
      res.json({ mensagem: 'Categoria atualizada com sucesso' });
    }
  });
});

// Deletar categoria
app.delete('/api/categorias/:id', (req, res) => {
  const { id } = req.params;
  
  // Verificar se há subcategorias
  db.get('SELECT COUNT(*) as count FROM subcategorias WHERE categoria_id = ?', [id], (err, subcatRow) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    
    if (subcatRow.count > 0) {
      return res.status(400).json({ 
        erro: 'Não é possível deletar categoria com subcategorias associadas',
        quantidade: subcatRow.count
      });
    }
    
    // Verificar se há transações usando esta categoria
    db.get('SELECT COUNT(*) as count FROM transacoes WHERE categoria LIKE ?', [`%${id}%`], (err, transRow) => {
      if (err) {
        return res.status(500).json({ erro: err.message });
      }
      
      // Buscar nome da categoria para verificar transações
      db.get('SELECT nome FROM categorias WHERE id = ?', [id], (err, catRow) => {
        if (err) {
          return res.status(500).json({ erro: err.message });
        }
        
        if (catRow) {
          db.get('SELECT COUNT(*) as count FROM transacoes WHERE categoria = ? OR categoria LIKE ?', 
            [catRow.nome, `${catRow.nome} > %`], (err, finalRow) => {
            if (err) {
              return res.status(500).json({ erro: err.message });
            }
            
            if (finalRow.count > 0) {
              return res.status(400).json({ 
                erro: 'Não é possível deletar categoria com transações associadas',
                quantidade: finalRow.count
              });
            }
            
            // Deletar categoria
            db.run('DELETE FROM categorias WHERE id = ?', [id], function(err) {
              if (err) {
                res.status(500).json({ erro: err.message });
              } else if (this.changes === 0) {
                res.status(404).json({ erro: 'Categoria não encontrada' });
              } else {
                res.json({ mensagem: 'Categoria deletada com sucesso' });
              }
            });
          });
        } else {
          res.status(404).json({ erro: 'Categoria não encontrada' });
        }
      });
    });
  });
});

// ========== ENDPOINTS DE SUBCATEGORIAS ==========

// Listar subcategorias
app.get('/api/subcategorias', (req, res) => {
  const { categoria_id } = req.query;
  
  let query = 'SELECT s.*, c.nome as categoria_nome, c.tipo as categoria_tipo FROM subcategorias s JOIN categorias c ON s.categoria_id = c.id';
  const params = [];
  
  if (categoria_id) {
    query += ' WHERE s.categoria_id = ?';
    params.push(categoria_id);
  }
  
  query += ' ORDER BY s.nome ASC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ erro: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Obter uma subcategoria específica
app.get('/api/subcategorias/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT s.*, c.nome as categoria_nome, c.tipo as categoria_tipo FROM subcategorias s JOIN categorias c ON s.categoria_id = c.id WHERE s.id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ erro: err.message });
    } else if (!row) {
      res.status(404).json({ erro: 'Subcategoria não encontrada' });
    } else {
      res.json(row);
    }
  });
});

// Criar subcategoria
app.post('/api/subcategorias', (req, res) => {
  const { categoria_id, nome } = req.body;
  
  if (!categoria_id || !nome) {
    return res.status(400).json({ erro: 'Categoria ID e nome são obrigatórios' });
  }
  
  db.run('INSERT INTO subcategorias (categoria_id, nome) VALUES (?, ?)', [categoria_id, nome], function(err) {
    if (err) {
      res.status(500).json({ erro: err.message });
    } else {
      res.status(201).json({ 
        id: this.lastID,
        categoria_id,
        nome,
        mensagem: 'Subcategoria criada com sucesso' 
      });
    }
  });
});

// Atualizar subcategoria
app.put('/api/subcategorias/:id', (req, res) => {
  const { id } = req.params;
  const { categoria_id, nome } = req.body;
  
  if (!categoria_id || !nome) {
    return res.status(400).json({ erro: 'Categoria ID e nome são obrigatórios' });
  }
  
  db.run('UPDATE subcategorias SET categoria_id = ?, nome = ? WHERE id = ?', [categoria_id, nome, id], function(err) {
    if (err) {
      res.status(500).json({ erro: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ erro: 'Subcategoria não encontrada' });
    } else {
      res.json({ mensagem: 'Subcategoria atualizada com sucesso' });
    }
  });
});

// Deletar subcategoria
app.delete('/api/subcategorias/:id', (req, res) => {
  const { id } = req.params;
  
  // Buscar nome da subcategoria e categoria para verificar transações
  db.get('SELECT s.nome as subcategoria_nome, c.nome as categoria_nome FROM subcategorias s JOIN categorias c ON s.categoria_id = c.id WHERE s.id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    
    if (!row) {
      return res.status(404).json({ erro: 'Subcategoria não encontrada' });
    }
    
    // Verificar se há transações usando esta subcategoria
    const categoriaCompleta = `${row.categoria_nome} > ${row.subcategoria_nome}`;
    db.get('SELECT COUNT(*) as count FROM transacoes WHERE categoria = ?', [categoriaCompleta], (err, transRow) => {
      if (err) {
        return res.status(500).json({ erro: err.message });
      }
      
      if (transRow.count > 0) {
        return res.status(400).json({ 
          erro: 'Não é possível deletar subcategoria com transações associadas',
          quantidade: transRow.count
        });
      }
      
      // Deletar subcategoria
      db.run('DELETE FROM subcategorias WHERE id = ?', [id], function(err) {
        if (err) {
          res.status(500).json({ erro: err.message });
        } else if (this.changes === 0) {
          res.status(404).json({ erro: 'Subcategoria não encontrada' });
        } else {
          res.json({ mensagem: 'Subcategoria deletada com sucesso' });
        }
      });
    });
  });
});

// Servir arquivos estáticos em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

