import { Elysia, t } from 'elysia';
import { html } from '@elysiajs/html';
import * as elements from 'typed-html';
import { Todo, TodoForm, TodoItem, TodoList } from './components/Todo';

const app = new Elysia()
  .use(html())
  .get('/', ({ html }) => html(
    <BaseHtml>
      <body
        class='flex w-full h-screen justify-center items-center'
        hx-get="/todos"
        hx-trigger="load"
        hx-swap="innerHTML"
        />
    </BaseHtml>
  ))
  .get('/todos', () => <TodoList todos={db} />)
  .post('/todos/toggle/:id', ({ params }) => {
    const todo = db.find((todo) => todo.id === params.id);
    if (todo) {
      todo.completed = !todo.completed;
      return <TodoItem { ...todo } />
    }
  },
  {
    params: t.Object({
      id: t.Numeric(),
    })
  }
  )
  .delete('/todos/:id', ({ params }) => {
    const todo = db.find((todo) => todo.id === params.id);
    if (todo) {
      db.splice(db.indexOf(todo), 1);
    }
  },
  {
    params: t.Object({
      id: t.Numeric(),
    })
  }
  )
  .post('/todos', ({ body }) => {
    if (body.content.length === 0) {
      throw new Error("Content Cannot be Empty");
    }
    const newTodo = {
      id: db.length + 1,
      content: body.content,
      completed: false,
    }
    db.push(newTodo);
    return <TodoItem { ...newTodo} />
  },
  {
    body: t.Object({
      content: t.String(),
    })
  })
  .get("/styles.css", () => Bun.file("./tailwind-gen/styles.css"))
  .listen(3000);

console.log(`🐇 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);

const BaseHtml = ({ children }: elements.Children) => `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>THE BETH STACK</title>
  <script src="https://unpkg.com/htmx.org@1.9.3"></script>
  <script src="https://unpkg.com/hyperscript.org@0.9.9"></script>
  <link href="/styles.css" rel="stylesheet">
</head>
${children}
`

const db: Todo[] = [
  { id: 1, content: "learn bun", completed: true },
  { id: 2, content: "learn go", completed: false },
]