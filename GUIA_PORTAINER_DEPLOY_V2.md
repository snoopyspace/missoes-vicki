# Guia Completo: Deploy no Portainer/ZimaOS 1.5.4

**Versão:** 2.0  
**Data:** 23 de março de 2026  
**Aplicação:** Missões da Vicki  
**Repositório:** https://github.com/snoopyspace/missoes-vicki

---

## 📋 Pré-requisitos

- ✅ ZimaOS 1.5.4 instalado e funcionando
- ✅ Portainer instalado (geralmente vem com ZimaOS)
- ✅ Acesso à interface web do Portainer
- ✅ Conexão com internet (para clonar repositório)
- ✅ Pelo menos 4GB de RAM disponível
- ✅ Pelo menos 10GB de espaço em disco

---

## 🚀 Passo 1: Acessar Portainer

### 1.1 Abrir Interface Web

1. Abra seu navegador
2. Acesse: **http://seu-ip-zimaos:9000** (ou a porta configurada)
   - Exemplo: `http://192.168.1.100:9000`
3. Faça login com suas credenciais

### 1.2 Selecionar Ambiente

1. No menu esquerdo, clique em **"Environments"** ou **"Ambientes"**
2. Selecione o ambiente local (geralmente **"local"**)

---

## 📦 Passo 2: Criar Nova Stack

### 2.1 Ir para Stacks

1. No menu esquerdo, clique em **"Stacks"** ou **"Pilhas"**
2. Clique no botão **"+ Add Stack"** ou **"+ Adicionar Pilha"**

### 2.2 Configurar Stack

Na tela de criação:

| Campo | Valor |
|-------|-------|
| **Name** | `missoes-vicki` |
| **Build method** | Selecione **"Git Repository"** ou **"Repositório Git"** |

### 2.3 Preencher Dados do Git

| Campo | Valor |
|-------|-------|
| **Repository URL** | `https://github.com/snoopyspace/missoes-vicki.git` |
| **Repository ref** | `main` |
| **Compose path** | `docker-compose.yml` |

---

## ⚙️ Passo 3: Configurar Variáveis de Ambiente

### 3.1 Adicionar Variáveis

Clique em **"+ Add variable"** ou **"+ Adicionar variável"** para cada uma:

#### Variáveis Essenciais:

```
JWT_SECRET = sua-chave-secreta-aqui-minimo-32-caracteres
VITE_APP_TITLE = Missões da Vicki
```

#### Variáveis Opcionais (deixe em branco se não tiver):

```
VITE_APP_ID = 
VITE_OAUTH_PORTAL_URL = https://api.manus.im
```

### 3.2 Exemplo de Preenchimento

```
Nome da Variável: JWT_SECRET
Valor: sua-chave-secreta-aqui-minimo-32-caracteres

Nome da Variável: VITE_APP_TITLE
Valor: Missões da Vicki
```

---

## 🎯 Passo 4: Deploy

### 4.1 Revisar Configuração

Antes de clicar em "Deploy", verifique:

- ✅ Nome da stack: `missoes-vicki`
- ✅ Repository URL: `https://github.com/snoopyspace/missoes-vicki.git`
- ✅ Repository ref: `main`
- ✅ Compose path: `docker-compose.yml`
- ✅ Variáveis preenchidas

### 4.2 Clicar em Deploy

1. Clique no botão **"Deploy the stack"** ou **"Implantar a pilha"**
2. Aguarde a mensagem de confirmação

---

## ⏳ Passo 5: Aguardar Build

O processo de build pode levar **10-20 minutos**. Você verá:

### 5.1 Monitorar Progresso

1. Vá para **"Stacks"** → **"missoes-vicki"**
2. Clique em **"Logs"** ou **"Registros"**
3. Você verá mensagens como:

```
Cloning into '/tmp/stack'...
Building Docker image...
Step 1/20 : FROM node:22-alpine AS builder
...
Successfully built missoes-vicki:latest
Starting containers...
```

### 5.2 Sinais de Progresso

| Mensagem | Significado |
|----------|------------|
| `Cloning into '/tmp/stack'...` | Baixando código do GitHub |
| `Building Docker image...` | Compilando a imagem Docker |
| `Step 1/20`, `Step 2/20`, etc. | Progresso do build |
| `Successfully built` | Build concluído com sucesso |
| `Starting containers...` | Iniciando containers |

---

## ✅ Passo 6: Verificar Status

### 6.1 Confirmar Containers Rodando

1. Vá para **"Stacks"** → **"missoes-vicki"**
2. Você deve ver dois containers:
   - ✅ `missoes-vicki-app` (status: **Running**)
   - ✅ `missoes-vicki-db` (status: **Running**)

### 6.2 Verificar Logs

1. Clique em **"Logs"** para ver mensagens recentes
2. Procure por:
   ```
   Server running on http://localhost:3000/
   Database connected successfully
   ```

### 6.3 Verificar Portas

1. Vá para **"Containers"** ou **"Containers"**
2. Procure por `missoes-vicki-app`
3. Verifique se a porta **3000** está mapeada

---

## 🌐 Passo 7: Acessar a Aplicação

### 7.1 Encontrar IP do ZimaOS

Se não souber o IP:

1. Abra terminal/prompt de comando
2. Execute: `ping seu-zimaos.local` ou `ping seu-zimaos`
3. Anote o IP (exemplo: `192.168.1.100`)

### 7.2 Abrir Aplicação

1. Abra seu navegador
2. Acesse: **http://seu-ip-zimaos:3000**
   - Exemplo: `http://192.168.1.100:3000`
3. Você deve ver a página inicial da Missões da Vicki

### 7.3 Testar Funcionalidades

1. **Clique em "Área da Vicki"** (sem senha necessária)
   - Você deve ver o dashboard com tarefas, pontos e medalhas

2. **Clique em "Painel dos Pais"**
   - Insira a senha: **88441339**
   - Você deve ver o painel de gerenciamento

3. **Crie uma tarefa de teste**
   - Clique em "Nova Tarefa"
   - Preencha os dados
   - Clique em "Salvar"

---

## 🔄 Passo 8: Atualizar Aplicação

Se você fez mudanças no GitHub e quer atualizar:

### 8.1 Opção 1: Pull & Redeploy (Recomendado)

1. Vá para **"Stacks"** → **"missoes-vicki"**
2. Clique em **"Pull & Redeploy"** ou **"Atualizar e Reimplantar"**
3. Aguarde o build (5-15 minutos)

### 8.2 Opção 2: Deletar e Recriar

Se o "Pull & Redeploy" não funcionar:

1. Vá para **"Stacks"** → **"missoes-vicki"**
2. Clique em **"Remove"** ou **"Remover"**
3. Confirme a exclusão
4. Repita os passos 2-7 acima

---

## 🆘 Troubleshooting

### Problema: "Build failed" ou "exit code: 254"

**Solução:**

1. Verifique os logs (clique em "Logs")
2. Procure pela mensagem de erro específica
3. Se for erro de pnpm:
   - Aguarde mais tempo (pode estar em progresso)
   - Tente "Pull & Redeploy" novamente
   - Se persistir, delete e recrie a stack

### Problema: "Cannot connect to http://seu-ip:3000"

**Solução:**

1. Verifique se os containers estão "Running"
2. Aguarde mais 30-60 segundos (MySQL pode estar iniciando)
3. Verifique os logs do container `missoes-vicki-app`
4. Verifique a porta 3000 está aberta no firewall

### Problema: "Connection refused" ao acessar

**Solução:**

1. Verifique se ambos containers estão "Running":
   - `missoes-vicki-app` ✅
   - `missoes-vicki-db` ✅
2. Aguarde mais tempo (MySQL leva tempo para iniciar)
3. Reinicie a stack:
   - Vá para **"Stacks"** → **"missoes-vicki"**
   - Clique em **"Stop"** → aguarde 10s → clique em **"Start"**

### Problema: "Database connection error"

**Solução:**

1. Verifique se o container `missoes-vicki-db` está "Running"
2. Aguarde mais 30-60 segundos (MySQL pode estar inicializando)
3. Verifique os logs do container `missoes-vicki-db`
4. Se persistir, delete e recrie a stack

### Problema: "Senha incorreta" no painel dos pais

**Solução:**

1. A senha correta é: **88441339**
2. Verifique se digitou corretamente (sem espaços)
3. Limpe o cache do navegador (Ctrl+Shift+Del)
4. Tente em outro navegador

---

## 📊 Monitoramento

### Verificar Uso de Recursos

1. Vá para **"Stacks"** → **"missoes-vicki"**
2. Clique em **"Stats"** ou **"Estatísticas"**
3. Você verá:
   - CPU usage
   - Memory usage
   - Network I/O

### Verificar Logs Regularmente

1. Vá para **"Stacks"** → **"missoes-vicki"** → **"Logs"**
2. Procure por erros (linhas em vermelho)
3. Se houver erros, anote e verifique a solução

---

## 💾 Backup de Dados

### Backup Manual

1. Vá para **"Volumes"** ou **"Volumes"**
2. Procure por `missoes-vicki_db-data`
3. Clique em **"Browse"** ou **"Procurar"**
4. Faça download dos arquivos do banco de dados

### Backup Automático (Recomendado)

Configure um cron job no ZimaOS para fazer backup diário:

```bash
# Exemplo: Backup diário às 2 da manhã
0 2 * * * docker run --rm -v missoes-vicki_db-data:/data -v /backup:/backup alpine tar czf /backup/vicki-db-$(date +%Y%m%d).tar.gz -C /data .
```

---

## 🎉 Sucesso!

Se você chegou aqui, a aplicação está funcionando! 🎊

### Próximos Passos:

1. **Comece a usar:**
   - Crie tarefas para a Vicki
   - Configure medalhas e recompensas
   - Acompanhe o progresso

2. **Customize:**
   - Altere o nome da Vicki
   - Escolha um avatar
   - Configure a cor favorita

3. **Monitore:**
   - Verifique logs regularmente
   - Acompanhe o uso de recursos
   - Faça backups periódicos

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs** (sempre o primeiro passo)
2. **Consulte este guia** (seção Troubleshooting)
3. **Verifique GitHub Issues:** https://github.com/snoopyspace/missoes-vicki/issues
4. **Reinicie a stack** (às vezes resolve)

---

## 📝 Notas Importantes

- ⚠️ A senha do painel dos pais é: **88441339** (não compartilhe)
- ⚠️ O banco de dados é persistente (dados não são perdidos ao reiniciar)
- ⚠️ Faça backups regularmente
- ⚠️ Mantenha o ZimaOS e Portainer atualizados
- ⚠️ Não mude as portas (3000 e 3306) sem atualizar a configuração

---

**Status:** ✅ Pronto para Produção  
**Versão:** 2.0  
**Última Atualização:** 23 de março de 2026
