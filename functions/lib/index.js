"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappWebhook = exports.onComponentLowStock = exports.weeklyReport = void 0;
var weekly_report_1 = require("./weekly-report");
Object.defineProperty(exports, "weeklyReport", { enumerable: true, get: function () { return weekly_report_1.weeklyReport; } });
var low_stock_1 = require("./low-stock");
Object.defineProperty(exports, "onComponentLowStock", { enumerable: true, get: function () { return low_stock_1.onComponentLowStock; } });
var webhook_1 = require("./whatsapp/webhook");
Object.defineProperty(exports, "whatsappWebhook", { enumerable: true, get: function () { return webhook_1.whatsappWebhook; } });
// export { assistant } from "./assistant"; // reativar quando tiver ANTHROPIC_API_KEY
//# sourceMappingURL=index.js.map