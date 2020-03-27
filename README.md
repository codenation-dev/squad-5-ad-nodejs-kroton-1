# Sentinel Log API

Bem vindo à primeira versão da API de registro e monitoramento de logs Sentinellog!

Se você possui várias aplicaçoes e ou vários serviços e precisa acompanhar e tomar decisoes com base nos logs, conheça e experimente aqui mesmo a nova API Sentinellog.

Esta versão da API pode registrar e monitorar logs de aplicaçoes em seus diversos níveis de severidade/tipos, e tenta aderir ao máximo à arquitetura REST.

Nesta página você pode conhecer e experimentar as URLs das rotas da API, os parâmetros de query string que podem ser aplicados para filtrar e selecionar resultados, e as estruturas de logs que são retornadas.

Além do método HTTP GET, você também pode usar o método POST para os serviços que requerem maior privacidade.

É possível ainda configurar a emissao de alertas baseadas em triggers pré-definidas.

Toda a parte de registro automático de logs por aplicaçoes pode ser diretamente acoplada à API, as requests sao feitas sem sessao, por meio de um token específico da aplicaçao.

Para as demais rotas e serviços, como consulta de logs, cadastro de aplicaçoes e etc, recomendamos o uso de um frontend, nesse caso a autenticaçao é feita usando email e senha. 

Por padrão, todos os serviços precisam de autenticaçao, com excessao da rota de registro, que é por onde o usuário se cadastra e também o reset de senha.

ATENÇÃO: Esta versão é preliminar, sujeita a mudanças. Caso você encontre problemas ou queira dar sugestões, por favor entre em contato.

## Requisitos
​
Para usar esta API você precisará de:

- NodeJS LTS (8.12.0+)
- Docker
- Docker Compose

## Detalhes

O arquivo `docker-compose.yml` está configurado com o necessário para iniciar o banco de dados MariaDB, já com os bancos `sentinel_log_dev` e `sentinel_log_test`.

Para iniciar o banco, execute o comando:

```
$ docker-compose up -d
```

Para baixar as dependencias, execute o comando:

```
$ npm install
```

Crie um arquivo chamado variables.env na raiz do projeto com as seguintes variáveis:

`DB_HOST`
`DB_USER`
`DB_PASS`
`DB_DIALECT`
`DB_PORT`
`NODE_ENV`
`JWT_KEY`

Para criar as tabelas no banco, execute o comando:

```
$ npx sequelize db:migrate
```

Para iniciar o servidor, execute o comando:

```
$ npm run dev
```

## A API possui os seguintes endpoints:

### /v1/users

Método: GET

Retorna a lista de usuários cadastrados.

Resposta:

StatusCode: 200
```json
{
  "total": Number,
  "data": [
    {
      "id": Number,
      "name": String,
      "email": String,
      "admin": Boolean,
      "createdAt": Date,
      "updatedAt": Date
    }
  ]
}
```

### /v1/users/:userId

Método: GET

Retorna o usuário cadastro para o parâmetro referido (userId)

Resposta:

StatusCode: 200
```json
{
  "id": Number,
  "name": String,
  "email": String,
  "admin": Boolean,
  "createdAt": Date,
  "updatedAt": Date
}
```

### /v1/users

Método: POST

Para usuario administrador criar um novo cadastro de usuario (todos os campos são obrigatórios).

Corpo aceito:
```json
{
  "name": String,
  "email": String,
  "password": String
}
```

Resposta:
StatusCode: 201
```json
{
  "id": Number,
  "name": String,
  "email": String,
  "admin": Boolean,
  "createdAt": Date,
  "updatedAt": Date
}
```

### /v1/users/register

Método: POST

Cria um novo cadastro de usuario (todos os campos são obrigatórios).

Corpo aceito:
```json
{
  "name": String,
  "email": String,
  "password": String
}
```

Resposta:
StatusCode: 201
```json
{
  "id": Number,
  "name": String,
  "email": String,
  "admin": Boolean,
  "createdAt": Date,
  "updatedAt": Date
}
```

### /v1/users/:userId

Método: PATCH

Atualiza os dados de cadastro do usuario referido no parâmetro `userId`. Os campos a serem atualizados são opcionais, com exceção do campo `id`, claro.

Corpo aceito:
```json
{
  "name": String,
  "email": String,
  "password": String
}
```
Resposta:
StatusCode: 200
```json
{
  "id": Number,
  "name": String,
  "email": String,
  "admin": Boolean,
  "createdAt": Date,
  "updatedAt": Date
}
```

### /v1/users/:userId

Método: DELETE

Remove o usuario determinado pelo parâmetro `userId`.

Resposta:
StatusCode: 204

### /v1/users/userId/change-pass

Método: POST

Atualiza a senha de cadastro do usuario referido no parâmetro `userId`.

Corpo aceito:
```json
{
  "password": String
}
```

Resposta:
StatusCode: 204

### /v1/users/forgotten-pass

Método: POST

Envia um e-mail com token para resetar a senha de cadastro do usuario referido no parâmetro `email`.

Corpo aceito:
```json
{
  "email": String
}
```

Resposta:
StatusCode: 200
```json
{
    "msg": String
}
```

### /v1/users/reset-pass

Método: POST

Atualiza a senha de cadastro do usuario referido no parâmetro `token`.

Corpo aceito:
```json
{
    "token": String,
    "password":String
}
```

Resposta:
StatusCode: 204

### /v1/applications

Método: GET

Retorna a lista de aplicações cadastrados.

Resposta:

StatusCode: 200
```json
{
  "total": Number,
  "data": [
    {
      "id": Number,
      "name": String,
      "description": String,
      "token": Boolean,
      "createdAt": Date,
      "updatedAt": Date,
      "user": {
        "id": Number,
        "name": String
      }
    }
  ]
}
```

### /v1/applications/:applicationId

Método: GET

Retorna a aplicação cadastrada para o parâmetro `applicationId`

Resposta:

StatusCode: 200
```json
{
  "id": Number,
  "name": String,
  "description": String,
  "token": Boolean,
  "createdAt": Date,
  "updatedAt": Date,
  "user": {
    "id": Number,
    "name": String
  }
}
```

### /v1/applications

Método: POST

Cria uma nova aplicação para o usuário (todos os campos são obrigatórios).

Corpo aceito:
```json
{
	"name": String,
	"description": String
}
```

Resposta:
StatusCode: 201
```json
{
  "id": Number,
  "name": String,
  "description": String,
  "token": Boolean,
  "createdAt": Date,
  "updatedAt": Date,
  "user": {
    "id": Number,
    "name": String
  }
}
```

### /v1/applications/:applicationId

Método: PATCH

Atualiza os dados de cadastro da aplicação referida no parâmetro `applicationId`.

Corpo aceito:
```json
{
	"name": String,
	"description": String
}
```
Resposta:
StatusCode: 200
```json
{
  "id": Number,
  "name": String,
  "description": String,
  "token": Boolean,
  "createdAt": Date,
  "updatedAt": Date,
  "user": {
    "id": Number,
    "name": String
  }
}
```

### /v1/application/:applicationId

Método: DELETE

Remove a aplicação determinado pelo parâmetro `applicationId`.

Resposta:
StatusCode: 204

### /v1/logs

Método: GET

essa rota aceita parâmetros de filtro como:

`/v1/logs?filter=environment=prod`
`/v1/logs?filter=level=error`
`/v1/logs?filter=events<=2`
`/v1/logs?filter=applicationId=1`
`/v1/logs?filter=archived=1`

Retorna a lista de logs cadastrados.

Resposta:

StatusCode: 200
```json
{
  "total": Number,
  "data": [
    {
      "id": Number,
      "title": String,
      "level": String,
      "events": Number,
      "environment": String,
      "source_address": String,
      "archived": Boolean,
      "createdAt": Date,
      "application": {
        "id": Number,
        "name": String,
        "description": String,
        "userId": Number,
        "user": {
            "id": Number,
            "name": String
        }
      }
    }
  ]
}
```

### /v1/logs/:logId

Método: GET

Retorna a aplicação cadastrada para o parâmetro `logId`

Resposta:

StatusCode: 200
```json
{
  "id": Number,
  "title": String,
  "level": String,
  "detail":String,
  "events": Number,
  "environment": String,
  "source_address": String,
  "archived": Boolean,
  "createdAt": Date,
  "application": {
    "id": Number,
    "name": String,
    "description": String,
    "userId": Number,
    "user": {
        "id": Number,
        "name": String
    }
  }
}
```

### /v1/logs?token=

Método: POST

Cria um novo log para a applicação (todos os campos são obrigatórios).

Corpo aceito:
```json
{
  "title": String,
  "detail":String,
  "level": String,
  "events": Number,
  "environment": String,
  "source_address": String,
}
```

Resposta:
StatusCode: 201
```json
{
  "id": Number,
  "title": String,
  "level": String,
  "detail":String,
  "events": Number,
  "environment": String,
  "source_address": String,
  "archived": Boolean,
  "createdAt": Date,
  "application": {
    "id": Number,
    "name": String,
    "description": String,
    "userId": Number,
    "user": {
        "id": Number,
        "name": String
    }
  }
}
```

### /v1/logs/:logId/archive

Método: PATCH

Arquiva o log referido no parâmetro `logId`.

Corpo aceito:
```json
{
	"archived": Boolean,
}
```

Resposta:
StatusCode: 204

### /v1/logs/:logId

Método: DELETE

Remove o log determinado pelo parâmetro `logId`.

Resposta:
StatusCode: 204

### /v1/applications/applicationId/notifications

Método: GET

Retorna a lista de notificações cadastrados.

Resposta:

StatusCode: 200
```json
{
  "total": Number,
  "data": [
    {
      "id": Number,
      "name": String,
      "detail": String,
      "createdAt": Date,
      "updatedAt": Date,
      "triggers": [
        {
          "id": Number,
          "field": String,
          "condition": String,
          "value": String
        }
      ],
      "alerts": [
        {
          "id": Number,
          "type": String,
          "to": String,
          "message": String
        }
      ]
    }
  ]
}
```

### /v1/applications/:applicationId/notifications/notificationId

Método: GET

Retorna a notificação cadastrada para os parâmetros `applicationId` e `notificationId`

Resposta:

StatusCode: 200
```json
{
  "id": Number,
  "name": String,
  "detail": String,
  "createdAt": Date,
  "updatedAt": Date,
  "triggers": [
    {
      "id": Number,
      "field": String,
      "condition": String,
      "value": String
    }
  ],
  "alerts": [
    {
      "id": Number,
      "type": String,
      "to": String,
      "message": String
    }
  ]
}
```

### /v1/applications/:applicationId/notifications

Método: POST

Cria uma nova notificação para a aplicação (todos os campos são obrigatórios).

Corpo aceito:
```json
{
	"name": String,
	"detail": String
}
```

Resposta:
StatusCode: 201
```json
{
  "id": Number,
  "name": String,
  "detail": String,
  "createdAt": Date,
  "updatedAt": Date,
  "triggers": [],
  "alerts": []
}
```

### /v1/applications/:applicationId/notifications/notificationId

Método: PATCH

Atualiza os dados de cadastro da notificação para a aplicação referida nos parâmetros `applicationId` e `notificationId`.

Corpo aceito:
```json
{
	"name": String,
	"detail": String
}
```
Resposta:
StatusCode: 200
```json
{
  "id": Number,
  "name": String,
  "detail": String,
  "createdAt": Date,
  "updatedAt": Date,
  "triggers": [
    {
      "id": Number,
      "field": String,
      "condition": String,
      "value": String
    }
  ],
  "alerts": [
    {
      "id": Number,
      "type": String,
      "to": String,
      "message": String
    }
  ]
}
```

### /v1/applications/:applicationId/notifications/notificationId

Método: DELETE

Remove a notificação determinado pelos parâmetros `applicationId` e `notificationId` .

Resposta:
StatusCode: 204

### /v1/applications/applicationId/notifications/triggers

Método: GET

Retorna a lista de triggers cadastrados.

Resposta:

StatusCode: 200
```json
{
  "total": Number,
  "data": [
    {
      "id": Number,
      "field": String,
      "condition": String,
      "value": String,
      "createdAt": Date,
      "updatedAt": Date
    }
  ]
}
```

### /v1/applications/applicationId/notifications/triggers/triggerId

Método: GET

Retorna a trigger cadastrada para os parâmetros `applicationId`, `notificationId` e `triggerId`.

Resposta:

StatusCode: 200
```json
{
  "id": Number,
  "field": String,
  "condition": String,
  "value": String,
  "createdAt": Date,
  "updatedAt": Date
}
```

### /v1/applications/applicationId/notifications/triggers

Método: POST

Cria um novo trigger para a notificação (todos os campos são obrigatórios).

Corpo aceito:
```json
{
	"field": String,
	"condition": String,
	"value": String
}
```

Resposta:
StatusCode: 201
```json
{
  "id": Number,
  "field": String,
  "condition": String,
  "value": String,
  "createdAt": Date,
  "updatedAt": Date
}
```

### /v1/applications/applicationId/notifications/triggers/triggerId

Método: PATCH

Atualiza os dados de cadastro do trigger para a notificação referida nos parâmetros `applicationId`, `notificationId` e `triggerId`.

Corpo aceito:
```json
{
	"field": String,
	"condition": String,
	"value": String
}
```
Resposta:
StatusCode: 200
```json
{
  "id": Number,
  "field": String,
  "condition": String,
  "value": String,
  "createdAt": Date,
  "updatedAt": Date
}
```

### /v1/applications/applicationId/notifications/triggers/triggerId

Método: DELETE

Remove a trigger determinado nos parâmetros `applicationId`, `notificationId` e `triggerId`.

Resposta:
StatusCode: 204

### /v1/applications/applicationId/notifications/alerts

Método: GET

Retorna a lista de alerts cadastrados.

Resposta:

StatusCode: 200
```json
{
  "total": Number,
  "data": [
    {
      "id": Number,
      "type": String,
      "to": String,
      "message": String,
      "createdAt": Date,
      "updatedAt": Date
    }
  ]
}
```

### /v1/applications/applicationId/notifications/alerts/alertId

Método: GET

Retorna o alert cadastrado para os parâmetros `applicationId`, `notificationId` e `alertId`.

Resposta:

StatusCode: 200
```json
{
  "id": Number,
  "type": String,
  "to": String,
  "message": String,
  "createdAt": Date,
  "updatedAt": Date
}
```

### /v1/applications/applicationId/notifications/alerts

Método: POST

Cria um novo alert para a notificação (todos os campos são obrigatórios).

Corpo aceito:
```json
{
	"type": String,
	"to": String,
	"message": String
}
```

Resposta:
StatusCode: 201
```json
{
  "id": Number,
  "type": String,
  "to": String,
  "message": String,
  "createdAt": Date,
  "updatedAt": Date
}
```

### /v1/applications/applicationId/notifications/alerts/alertId

Método: PATCH

Atualiza os dados de cadastro do alert para a notificação referida nos parâmetros `applicationId`, `notificationId` e `alertId`.

Corpo aceito:
```json
{
	"type": String,
	"to": String,
	"message": String
}
```
Resposta:
StatusCode: 200
```json
{
  "id": Number,
  "type": String,
  "to": String,
  "message": String,
  "createdAt": Date,
  "updatedAt": Date
}
```

### /v1/applications/applicationId/notifications/alerts/alertId

Método: DELETE

Remove o alert determinado nos parâmetros `applicationId`, `notificationId` e `alertId`.

Resposta:
StatusCode: 204
