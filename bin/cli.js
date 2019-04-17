"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const optimist_1 = require("optimist");
const dump_1 = require("./dump");
const pkg = JSON.parse(fs.readFileSync(path.normalize(__dirname + '/../package.json'), 'utf8'));
// Display help if requested
if (optimist_1.argv.help) {
    console.log(`
        ${pkg.name} ${pkg.version}

        Usage: redis-dump [OPTIONS]
          -h <hostname>    Server hostname (default: 127.0.0.1)
          -p <port>        Server port (default: 6379)
          -d <db>          Database number (default: 0)
          -a <auth>        Password
          -f <filter>      Query filter (default: *)
          --convert        Convert from json to redis commands
          --help           Output this help and exit
          --json           Output result as json
          --pretty         Make pretty indented output (use with --json)
          --tls            TLS connection to Redis (default: false)
          --dirty          Not prepared del key command (RPUSH, SADD, ZADD, HMSET) (default: false)
          
        Examples:
          redis-dump
          redis-dump -p 6500
          redis-dump -f 'mydb:*' > mydb.dump.txt
          redis-dump --json > mydb.json
          cat mydb.json | redis-dump --convert

        The output is a valid list of redis commands.
        That means the following will work:
          redis-dump > dump.txt      # Dump redis database
          cat dump.txt | redis-cli   # Import redis database from generated file

        `);
}
else {
    const params = {
        filter: optimist_1.argv.f ? optimist_1.argv.f : '*',
        db: optimist_1.argv.d ? optimist_1.argv.d : 0,
        port: optimist_1.argv.p ? optimist_1.argv.p : 6379,
        auth: optimist_1.argv.a ? optimist_1.argv.a : null,
        host: optimist_1.argv.h ? optimist_1.argv.h : '127.0.0.1',
        format: optimist_1.argv.json ? 'json' : 'redis',
        pretty: !!optimist_1.argv.pretty,
        tls: !!optimist_1.argv.tls,
        dirty: !!optimist_1.argv.dirty
    };
    // Dump operation
    const doDump = () => {
        return dump_1.dump(params, (err, result) => {
            if (err != null) {
                return process.stderr.write((err.message ? err.message : err) + "\n");
            }
            if ((result != null) && ("" + result).replace(/^\s+/, '').replace(/\s+$/, '') !== '') {
                console.log(result);
            }
            return process.exit(0);
        });
    };
    // If we are converting a stream from stdin, read it to the end
    if (optimist_1.argv.convert) {
        params.convert = '';
        process.stdin.resume();
        process.stdin.on('data', (chunk) => {
            return params.convert += "" + chunk;
        });
        process.stdin.on('end', () => {
            return doDump();
        });
        // Otherwise just run dump directly
    }
    else {
        doDump();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFDN0IsdUNBQThCO0FBQzlCLGlDQUE0QjtBQUU1QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsa0JBQWtCLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ2hHLDRCQUE0QjtBQUM1QixJQUFJLGVBQUksQ0FBQyxJQUFJLEVBQUU7SUFDWCxPQUFPLENBQUMsR0FBRyxDQUFDO1VBQ04sR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsT0FBTzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBMkJ4QixDQUFDLENBQUM7Q0FDVjtLQUFNO0lBQ0gsTUFBTSxNQUFNLEdBQVE7UUFDaEIsTUFBTSxFQUFFLGVBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUc7UUFDN0IsRUFBRSxFQUFFLGVBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsSUFBSSxFQUFFLGVBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7UUFDNUIsSUFBSSxFQUFFLGVBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7UUFDNUIsSUFBSSxFQUFFLGVBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVc7UUFDbkMsTUFBTSxFQUFFLGVBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTztRQUNwQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLGVBQUksQ0FBQyxNQUFNO1FBQ3JCLEdBQUcsRUFBRSxDQUFDLENBQUMsZUFBSSxDQUFDLEdBQUc7UUFDZixLQUFLLEVBQUUsQ0FBQyxDQUFDLGVBQUksQ0FBQyxLQUFLO0tBQ3RCLENBQUM7SUFDRixpQkFBaUI7SUFDakIsTUFBTSxNQUFNLEdBQUcsR0FBRyxFQUFFO1FBQ2hCLE9BQU8sV0FBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNoQyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUU7Z0JBQ2IsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO2FBQ3pFO1lBQ0QsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUNsRixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3ZCO1lBQ0QsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDO0lBRUYsK0RBQStEO0lBQy9ELElBQUksZUFBSSxDQUFDLE9BQU8sRUFBRTtRQUNkLE1BQU0sQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdkIsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDL0IsT0FBTyxNQUFNLENBQUMsT0FBTyxJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUM7UUFDeEMsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFO1lBQ3pCLE9BQU8sTUFBTSxFQUFFLENBQUM7UUFDcEIsQ0FBQyxDQUFDLENBQUE7UUFFRixtQ0FBbUM7S0FDdEM7U0FBTTtRQUNILE1BQU0sRUFBRSxDQUFBO0tBQ1g7Q0FDSiJ9