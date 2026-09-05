const { z } = require('zod');
try {
  z.string().regex(/^[A-Z]/).parse('a');
} catch (err) {
  console.log("instanceof ZodError:", err instanceof z.ZodError);
  console.log("err.errors:", err.errors);
  console.log("err.issues:", err.issues);
}
