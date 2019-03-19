"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dump_1 = require("./dump");
dump_1.dump({
    filter: '*'
}, function (err, result) {
    if (err != null) {
        return process.stderr.write(err + "\n");
    }
    return console.log(result);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQTRCO0FBRTVCLFdBQUksQ0FBQztJQUNELE1BQU0sRUFBRSxHQUFHO0NBQ2QsRUFBRSxVQUFVLEdBQUcsRUFBRSxNQUFNO0lBQ3BCLElBQUksR0FBRyxJQUFJLElBQUksRUFBRTtRQUNiLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDO0tBQzNDO0lBQ0QsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQy9CLENBQUMsQ0FBQyxDQUFDIn0=