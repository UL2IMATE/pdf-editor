const util = require("node:util");
if (util.styleText) {
  const orig = util.styleText;
  util.styleText = (format, text) => {
    if (Array.isArray(format)) {
      return format.reduce((acc, f) => {
        try {
          return orig(f, acc);
        } catch {
          return acc;
        }
      }, text);
    }
    return orig(format, text);
  };
}
