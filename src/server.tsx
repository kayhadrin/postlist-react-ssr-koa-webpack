import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  renderToNodeStream,
  renderToStaticNodeStream,
} from 'react-dom/server';

import Koa from 'koa';
import KoaRouter from 'koa-router';
import KoaBodyParser from 'koa-bodyparser';
import KoaStatic from 'koa-static';
import MultiStream from 'multistream';
import stringStream from 'string-to-stream';

import App from './App';
import html from './html';
import { getHeadSection } from './html';

import { loadTranslations } from './helpers/translations';
import sleep from './helpers/sleep';
import requestCountMiddleware from './middleware/requestCount';

// import { createNamespace } from 'continuation-local-storage';
import { createNamespace } from 'cls-hooked';
const session = createNamespace('session');

// session.run(() => {
  var server = new Koa();
  var bodyParser = new KoaBodyParser();
  const router = new KoaRouter();

  server.use(KoaStatic('dist'));
  server.use(bodyParser);
  server.use(requestCountMiddleware);
  server.use(router.routes());


  // var db = require('./lib/db.js');

  // function start(options, next) {
  //   db.fetchUserById(options.id, function (error, user) {
  //     if (error) return next(error);

  //     session.set('user', user);

  //     next();
  //   });
  // }

  router.get('/', async (ctx) => {
    await session.runAndReturn(async (outer) => {
      // Simulate the slowness of getting initial app data via an API call
      await sleep(1000);

      let locale = 'en_US';
      if (ctx.query && ctx.query.locale) {
        locale = ctx.query.locale;
      }
      // ctx.state.locale = locale;
      console.log('DEBUG ctx:locale=', locale);
      session.set('locale', locale);
      console.log('DEBUG 1 session:locale=', session.get('locale'));
      await loadTranslations(locale, true);
      console.log('DEBUG 2 session:locale=', session.get('locale'));

      // Traditional Server Side Rendering
      // const body = renderToString(<App />);
      // ctx.body = html({ body, locale });

      // Simulate the time it will take for a production app to actually create the stream
      const getSlowStream = async () => {
        await sleep(500);
        return stringStream('<body><div id="root">');
      }

      const slowStream = await getSlowStream();
      // Stream the HTML response
      const stream = new MultiStream([
        () => stringStream(`<!DOCTYPE html><html lang=${locale}>`),
        () => renderToStaticNodeStream(getHeadSection()),
        () => slowStream,
        () => renderToNodeStream(<App />),
        () => stringStream('</div></body><script src="js/client.js"></script></html>'),
      ]);

      ctx.response.type = 'text/html; charset=utf-8';
      ctx.status = 200;
      ctx.body = stream;
    });
  });

  server.listen(8088, () => {
    console.log('Server Listening on port 8088 🎉');
  });

// });
