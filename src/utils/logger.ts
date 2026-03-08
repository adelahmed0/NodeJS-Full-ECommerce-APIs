import chalk from "chalk";
import util from "util";

/**
 * @description Enhanced logger with exotic neon color-coding and type labels.
 * Designed to make different data types visually distinct in the terminal
 * to avoid confusion during development.
 */
const logger = (...args: any[]) => {
  // Mapping of data types to their respective HEX colors
  const colors = {
    STRING: chalk.hex("#40E0D0"), // Turquoise
    NUMBER: chalk.hex("#BF00FF"), // Electric Purple
    OBJECT: chalk.hex("#FA8072"), // Salmon Pink
    ARRAY: chalk.hex("#39FF14"), // Neon Lime
    BOOLEAN: chalk.hex("#E6E6FA"), // Lavender
    NULL: chalk.hex("#FF00FF"), // Fuchsia
    UNDEFINED: chalk.hex("#F0E68C"), // Khaki
    DEFAULT: chalk.hex("#00FFFF"), // Aqua
  };

  const coloredArgs = args.map((arg) => {
    let typeName: string = typeof arg;
    if (Array.isArray(arg)) typeName = "array";
    else if (arg === null) typeName = "null";

    const UPPER_TYPE = typeName.toUpperCase() as keyof typeof colors;
    const colorFn = colors[UPPER_TYPE] || colors.DEFAULT;

    // Bold label to identify the type of data being logged
    const typeLabel = colorFn.bold(`[${UPPER_TYPE}]`);

    let content;
    // Special formatting for objects to show full nested structures
    if (arg !== null && typeof arg === "object") {
      content = colorFn(
        util.inspect(arg, { colors: false, depth: null, compact: false }),
      );
    } else {
      content = colorFn(String(arg));
    }

    return `${typeLabel} ${content}`;
  });

  // Prefix each log with a lightning bolt symbol
  console.log(chalk.hex("#00FF00").bold("⚡"), ...coloredArgs);
};

export default logger;
