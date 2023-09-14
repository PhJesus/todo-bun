import { Elysia, t } from 'elysia';
import { html } from '@elysiajs/html';
import * as elements from 'typed-html';

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
  .listen(3000);

console.log(`🐇 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);

const BaseHtml = ({ children }: elements.Children) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://unpkg.com/htmx.org@1.9.3"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <title>BUNHTMX</title>
</head>
${children}
</html>
`

type Todo = {
  id: number;
  content: string;
  completed: boolean;
}

const db: Todo[] = [
  { id: 1, content: "learn bun", completed: true },
  { id: 2, content: "learn go", completed: false },
]

function TodoItem({ content, completed, id }: Todo) {
  return (
    <div class="flex flex-row space-x-3">
      <p>{content}</p>
      <input
        type="checkbox"
        checked={completed}
        hx-post={`/todos/toggle/${id}`}
        hx-target='closest div'
        hx-swap="outerHTML"
      />
      <button
        class="text-red-500"
        hx-delete={`/todos/${id}`}
        hx-swap="outerHTML"
        hx-target="closest div"
      >X</button>
    </div>
  )
}

function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <div>
      {todos.map((todo) => (
        <TodoItem { ...todo} />
      ))}
      <TodoForm/>
    </div>
  )
}

function TodoForm() {
  return (
    <form
      class="flex flex-row space-x-3"
      hx-post='/todos'
      hx-swap="beforebegin"
    >
      <input type="text" name='content' class='border border-black' />
      <button type='submit'>Add</button>
    </form>
  )
}