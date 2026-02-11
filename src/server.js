import app from './app.js';
import { env } from './config/env.js';
import './config/firebase.js';

app.listen(env.port, () => {
  console.log(`LoadEx backend running on port ${env.port}`);
});
