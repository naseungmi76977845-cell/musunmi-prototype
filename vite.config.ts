import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react()],server:{host:'127.0.0.1',port:8097,strictPort:true},build:{rolldownOptions:{input:{main:'index.html',admin:'admin.html'}}}});
