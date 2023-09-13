import { Elysia } from 'elysia';
import { html } from "@elysiajs/html";
import { type PropsWithChildren } from "@kitajs/html";
import 'htmx.org';

const baseHTML = <h1>Bun Dia</h1>

new Elysia()
    .use(html())
    .get('/', ({ set }) => { set.redirect = '/foo' })
    .get('/foo', () => ({
        hello: 'world'
    }))
    .listen(3000)


console.log(`Listening on http://localhost:3000 ...`);