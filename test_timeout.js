const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms));
