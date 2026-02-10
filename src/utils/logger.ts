import chalk from "chalk";
import util from "util";

/**
 * @description A premium logger that uses EXOTIC & RARE NEON colors
 * (Turquoise, Electric Purple, Salmon, etc.) to ensure they never clash
 * with any other logs in the project.
 */
const logger = (...args: any[]) => {
  // Ultra-distinct exotic neon colors
  const colors = {
    STRING: chalk.hex("#40E0D0"), // Turquoise (Fresh & unique)
    NUMBER: chalk.hex("#BF00FF"), // Electric Purple (Very striking)
    OBJECT: chalk.hex("#FA8072"), // Salmon Pink (Earthy but bright)
    ARRAY: chalk.hex("#39FF14"), // Neon Lime (Popping out)
    BOOLEAN: chalk.hex("#E6E6FA"), // Lavender (Soft but clearly different)
    NULL: chalk.hex("#FF00FF"), // Fuchsia (Intense)
    UNDEFINED: chalk.hex("#F0E68C"), // Khaki (Unique muted yellow)
    DEFAULT: chalk.hex("#00FFFF"), // Aqua
  };

  const coloredArgs = args.map((arg) => {
    let typeName: string = typeof arg;
    if (Array.isArray(arg)) typeName = "array";
    else if (arg === null) typeName = "null";

    const UPPER_TYPE = typeName.toUpperCase() as keyof typeof colors;
    const colorFn = colors[UPPER_TYPE] || colors.DEFAULT;

    // Create a bold label for the type
    const typeLabel = colorFn.bold(`[${UPPER_TYPE}]`);

    let content;
    if (arg !== null && typeof arg === "object") {
      content = colorFn(
        util.inspect(arg, { colors: false, depth: null, compact: false }),
      );
    } else {
      content = colorFn(String(arg));
    }

    return `${typeLabel} ${content}`;
  });

  // Unique separator with a custom glowing effect color
  console.log(chalk.hex("#00FF00").bold("⚡"), ...coloredArgs);
};

export default logger;
