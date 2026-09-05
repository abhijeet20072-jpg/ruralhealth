import { app } from './src/index';
app.listen(3000, () => {
    console.log("[Backend] Server is running on port 3000");
    setInterval(() => {}, 1000); // keep alive
});
