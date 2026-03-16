import { Hono } from 'hono';
import { serve } from '@hono/node-server';

import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import auth from './auth.js';
import hostels from './hostels.js';
import { jwt } from 'hono/jwt'

const app = new Hono();
const JWT_SECRET=process.env.JWT_SECRET || "super_secret_hostel_key"

console.log(JWT_SECRET)
app.use(logger())
app.use(cors())

// protected routes
app.use('/hostels/*', jwt({ secret: JWT_SECRET, alg: 'HS256' }));

app.route('/auth', auth);
app.route('/hostels', hostels);

app.get('/', (c) => {
    return c.text('Hello World!');
});

app.get('/health', (c) => {
    const message = "I'm alive: API is running well on port 5000";
    return c.json({ message });
});

serve({fetch: app.fetch, port: 5000}, () => {
    console.log('Server is running on port 5000');
});