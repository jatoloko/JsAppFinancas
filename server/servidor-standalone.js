const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Servir arquivos estáticos do frontend
const distPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(distPath));

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
      db.run(`ALTER TABLE transacoes ADD COLUMN subcategoria_id INTEGER`, (err) => {
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

function inserirCategoriasPadrao() {
  db.get('SELECT COUNT(*) as count FROM categorias', (err, row) => {
    if (err) {
      console.error('Erro ao verificar categorias:', err);
      return;
    }

    if (row.count === 0) {
      const categorias = [
        { nome: 'Salário', tipo: 'receita' },
        { nome: 'Freelance', tipo: 'receita' },
        { nome: 'Investimentos', tipo: 'receita' },
        { nome: 'Vendas', tipo: 'receita' },
        { nome: 'Presente', tipo: 'receita' },
        { nome: 'Reembolso', tipo: 'receita' },
        { nome: 'Outros', tipo: 'receita' },
        { nome: 'Alimentação', tipo: 'despesa' },
        { nome: 'Transporte', tipo: 'despesa' },
        { nome: 'Moradia', tipo: 'despesa' },
        { nome: 'Saúde', tipo: 'despesa' },
        { nome: 'Educação', tipo: 'despesa' },
        { nome: 'Lazer', tipo: 'despesa' },
        { nome: 'Compras', tipo: 'despesa' },
        { nome: 'Contas', tipo: 'despesa' },
        { nome: 'Impostos', tipo: 'despesa' },
        { nome: 'Outros', tipo: 'despesa' }
      ];

      const stmt = db.prepare('INSERT INTO categorias (nome, tipo) VALUES (?, ?)');
      categorias.forEach(cat => {
        stmt.run(cat.nome, cat.tipo);
      });
      stmt.finalize();
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
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).json({ erro: 'Transação não encontrada' });
    }
  });
});

// Criar nova transação
app.post('/api/transacoes', (req, res) => {
  const { tipo, categoria, valor, descricao, data } = req.body;
  
  if (!tipo || !categoria || !valor || !data) {
    return res.status(400).json({ erro: 'Campos obrigatórios: tipo, categoria, valor, data' });
  }
  
  db.run(
    'INSERT INTO transacoes (tipo, categoria, valor, descricao, data) VALUES (?, ?, ?, ?, ?)',
    [tipo, categoria, valor, descricao || null, data],
    function(err) {
      if (err) {
        res.status(500).json({ erro: err.message });
      } else {
        res.status(201).json({ id: this.lastID, ...req.body });
      }
    }
  );
});

// Atualizar transação
app.put('/api/transacoes/:id', (req, res) => {
  const { id } = req.params;
  const { tipo, categoria, valor, descricao, data } = req.body;
  
  db.run(
    'UPDATE transacoes SET tipo = ?, categoria = ?, valor = ?, descricao = ?, data = ? WHERE id = ?',
    [tipo, categoria, valor, descricao || null, data, id],
    function(err) {
      if (err) {
        res.status(500).json({ erro: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ erro: 'Transação não encontrada' });
      } else {
        res.json({ id: parseInt(id), ...req.body });
      }
    }
  );
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

// Obter estatísticas do mês anterior
app.get('/api/estatisticas/mes-anterior', (req, res) => {
  const { mes, ano } = req.query;
  
  if (!mes || !ano) {
    return res.status(400).json({ erro: 'Mês e ano são obrigatórios' });
  }

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
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).json({ erro: 'Categoria não encontrada' });
    }
  });
});

// Criar categoria
app.post('/api/categorias', (req, res) => {
  const { nome, tipo } = req.body;
  
  if (!nome || !tipo) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, tipo' });
  }
  
  db.run(
    'INSERT INTO categorias (nome, tipo) VALUES (?, ?)',
    [nome, tipo],
    function(err) {
      if (err) {
        res.status(500).json({ erro: err.message });
      } else {
        res.status(201).json({ id: this.lastID, nome, tipo });
      }
    }
  );
});

// Atualizar categoria
app.put('/api/categorias/:id', (req, res) => {
  const { id } = req.params;
  const { nome, tipo } = req.body;
  
  db.run(
    'UPDATE categorias SET nome = ?, tipo = ? WHERE id = ?',
    [nome, tipo, id],
    function(err) {
      if (err) {
        res.status(500).json({ erro: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ erro: 'Categoria não encontrada' });
      } else {
        res.json({ id: parseInt(id), nome, tipo });
      }
    }
  );
});

// Deletar categoria
app.delete('/api/categorias/:id', (req, res) => {
  const { id } = req.params;
  
  // Verificar se há transações usando esta categoria
  db.get('SELECT COUNT(*) as count FROM transacoes WHERE categoria LIKE ?', [`%${id}%`], (err, row) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    
    if (row.count > 0) {
      return res.status(400).json({ erro: 'Não é possível deletar categoria com transações associadas' });
    }
    
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
});

// ========== ENDPOINTS DE SUBCATEGORIAS ==========

// Listar subcategorias
app.get('/api/subcategorias', (req, res) => {
  const { categoria_id } = req.query;
  
  let query = `
    SELECT s.*, c.nome as categoria_nome, c.tipo as categoria_tipo
    FROM subcategorias s
    LEFT JOIN categorias c ON s.categoria_id = c.id
  `;
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
  db.get('SELECT * FROM subcategorias WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ erro: err.message });
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).json({ erro: 'Subcategoria não encontrada' });
    }
  });
});

// Criar subcategoria
app.post('/api/subcategorias', (req, res) => {
  const { categoria_id, nome } = req.body;
  
  if (!categoria_id || !nome) {
    return res.status(400).json({ erro: 'Campos obrigatórios: categoria_id, nome' });
  }
  
  db.run(
    'INSERT INTO subcategorias (categoria_id, nome) VALUES (?, ?)',
    [categoria_id, nome],
    function(err) {
      if (err) {
        res.status(500).json({ erro: err.message });
      } else {
        res.status(201).json({ id: this.lastID, categoria_id, nome });
      }
    }
  );
});

// Atualizar subcategoria
app.put('/api/subcategorias/:id', (req, res) => {
  const { id } = req.params;
  const { categoria_id, nome } = req.body;
  
  db.run(
    'UPDATE subcategorias SET categoria_id = ?, nome = ? WHERE id = ?',
    [categoria_id, nome, id],
    function(err) {
      if (err) {
        res.status(500).json({ erro: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ erro: 'Subcategoria não encontrada' });
      } else {
        res.json({ id: parseInt(id), categoria_id, nome });
      }
    }
  );
});

// Deletar subcategoria
app.delete('/api/subcategorias/:id', (req, res) => {
  const { id } = req.params;
  
  // Verificar se há transações usando esta subcategoria
  db.get('SELECT COUNT(*) as count FROM transacoes WHERE subcategoria_id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    
    if (row.count > 0) {
      return res.status(400).json({ erro: 'Não é possível deletar subcategoria com transações associadas' });
    }
    
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

// Rota catch-all: servir index.html para todas as rotas não-API
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📱 Abra seu navegador e acesse: http://localhost:${PORT}\n`);
  
  // Tentar abrir o navegador automaticamente
  const { exec } = require('child_process');
  const url = `http://localhost:${PORT}`;
  
  const platform = process.platform;
  let command;
  
  if (platform === 'win32') {
    command = `start ${url}`;
  } else if (platform === 'darwin') {
    command = `open ${url}`;
  } else {
    command = `xdg-open ${url}`;
  }
  
  setTimeout(() => {
    exec(command, (error) => {
      if (error) {
        console.log('⚠️  Não foi possível abrir o navegador automaticamente.');
        console.log(`   Por favor, abra manualmente: ${url}`);
      }
    });
  }, 1000);
});

