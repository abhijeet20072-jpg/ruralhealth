import { app } from './src/index';
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`[Backend] Server is running on port ${port}`);
});
