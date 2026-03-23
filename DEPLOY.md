# Guia de Deploy - Missões da Vicki

## Visão Geral

**Missões da Vicki** é um web app gamificado para gerenciar tarefas com um sistema de pontos, medalhas e animações. Este guia descreve como fazer o deploy no ZimaOS 1.5.4 usando Docker Compose.

## Requisitos

- ZimaOS 1.5.4 ou superior
- Docker e Docker Compose instalados
- Acesso ao terminal/SSH do ZimaOS
- Porta 3000 disponível (ou configurar uma diferente)

## Arquitetura

A aplicação utiliza:

- **Frontend**: React 19 + Tailwind CSS 4 com tema Memphis
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL 8.0 (compatível com TiDB)
- **Autenticação**: Suporta Manus OAuth (opcional)

## Estrutura do Projeto

```
missoes-vicki-v2/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas principais
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── App.tsx        # Roteamento
│   │   └── index.css      # Tema Memphis
│   └── index.html
├── server/                # Backend Express
│   ├── routers.ts         # Procedimentos tRPC
│   ├── db.ts              # Helpers de banco de dados
│   └── _core/             # Infraestrutura
├── drizzle/               # Schema e migrações
│   └── schema.ts
├── Dockerfile             # Imagem Docker
├── docker-compose.yml     # Orquestração
└── package.json
```

## Passo 1: Preparar o Servidor

1. Acesse o ZimaOS via SSH ou terminal
2. Crie um diretório para o projeto:

```bash
mkdir -p /opt/missoes-vicki
cd /opt/missoes-vicki
```

3. Clone ou copie os arquivos do projeto para este diretório

## Passo 2: Configurar Variáveis de Ambiente

1. Crie um arquivo `.env` baseado em `.env.example`:

```bash
cp .env.example .env
```

2. Edite o arquivo `.env` com suas configurações:

```bash
nano .env
```

### Configurações Essenciais

```env
# Database
DATABASE_URL=mysql://vicki_user:vicki_password@db:3306/missoes_vicki
DB_ROOT_PASSWORD=sua_senha_segura_aqui
DB_PASSWORD=vicki_password_segura

# Application
NODE_ENV=production
APP_PORT=3000

# Security
JWT_SECRET=gere_uma_chave_segura_aqui

# OAuth (opcional - deixe em branco se não usar)
VITE_APP_ID=
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=
OWNER_OPEN_ID=
OWNER_NAME=
```

**Importante**: Mude todas as senhas padrão para senhas seguras em produção!

## Passo 3: Build e Deploy com Docker Compose

### Opção A: Build Local (Recomendado para ZimaOS)

```bash
# Build a imagem Docker
docker-compose build

# Inicie os serviços
docker-compose up -d

# Verifique o status
docker-compose ps

# Veja os logs
docker-compose logs -f app
```

### Opção B: Usando Imagem Pré-construída

Se preferir usar uma imagem pré-construída:

1. Modifique o `docker-compose.yml`:

```yaml
app:
  image: seu-registry/missoes-vicki:latest
  # ... resto da configuração
```

2. Execute:

```bash
docker-compose up -d
```

## Passo 4: Inicializar o Banco de Dados

Após iniciar os containers, execute as migrações:

```bash
# Acesse o container da aplicação
docker-compose exec app sh

# Execute as migrações
pnpm db:push

# Saia do container
exit
```

## Passo 5: Acessar a Aplicação

1. Abra seu navegador
2. Acesse: `http://seu-servidor:3000`
3. Você verá a página inicial com opções para:
   - **Área da Vicki**: Gerenciar tarefas (sem senha)
   - **Painel dos Pais**: Gerenciar tarefas e configurações (senha: `88441339`)

## Gerenciamento

### Ver Logs

```bash
# Logs da aplicação
docker-compose logs -f app

# Logs do banco de dados
docker-compose logs -f db

# Últimas 100 linhas
docker-compose logs --tail=100 app
```

### Parar a Aplicação

```bash
docker-compose down
```

### Reiniciar

```bash
docker-compose restart app
```

### Backup do Banco de Dados

```bash
# Criar backup
docker-compose exec db mysqldump -u vicki_user -p missoes_vicki > backup.sql

# Restaurar backup
docker-compose exec -T db mysql -u vicki_user -p missoes_vicki < backup.sql
```

## Troubleshooting

### Erro: "Port 3000 already in use"

Mude a porta no `.env`:

```env
APP_PORT=3001
```

Ou libere a porta:

```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Erro: "Cannot connect to database"

1. Verifique se o container `db` está rodando:

```bash
docker-compose ps
```

2. Verifique a conectividade:

```bash
docker-compose exec app ping db
```

3. Verifique as credenciais no `.env`

### Erro: "Application won't start"

1. Verifique os logs:

```bash
docker-compose logs app
```

2. Certifique-se de que o banco de dados está pronto:

```bash
docker-compose logs db
```

3. Tente reconstruir:

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Configurações Avançadas

### Usar Domínio Customizado

Se tiver um domínio, configure um proxy reverso (nginx/traefik) apontando para `localhost:3000`.

### Aumentar Limite de Memória

Edite o `docker-compose.yml`:

```yaml
app:
  deploy:
    resources:
      limits:
        memory: 1G
```

### Usar Banco de Dados Externo

Modifique a variável `DATABASE_URL`:

```env
DATABASE_URL=mysql://user:password@seu-servidor-db:3306/database
```

## Segurança

1. **Altere todas as senhas padrão**
2. **Use HTTPS** em produção (configure proxy reverso)
3. **Mantenha o JWT_SECRET seguro**
4. **Faça backups regulares** do banco de dados
5. **Atualize as imagens Docker** regularmente

## Monitoramento

### Health Check

A aplicação inclui health checks automáticos. Verifique:

```bash
curl http://localhost:3000/
```

### Métricas

Os logs são salvos em:

```bash
docker-compose logs app | grep "error\|warning"
```

## Suporte

Para problemas ou dúvidas:

1. Verifique os logs: `docker-compose logs -f`
2. Verifique a conectividade do banco de dados
3. Certifique-se de que todas as variáveis de ambiente estão configuradas
4. Tente reconstruir e reiniciar os containers

## Próximos Passos

1. Configure um domínio customizado
2. Configure HTTPS/SSL
3. Configure backups automáticos
4. Configure monitoramento e alertas
5. Personalize as medalhas e tarefas padrão

---

**Versão**: 1.0.0  
**Última Atualização**: Março 2026  
**Compatibilidade**: ZimaOS 1.5.4+
