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
          --tls            tls
          
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFDN0IsdUNBQThCO0FBQzlCLGlDQUE0QjtBQUU1QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsa0JBQWtCLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ2hHLDRCQUE0QjtBQUM1QixJQUFJLGVBQUksQ0FBQyxJQUFJLEVBQUU7SUFDWCxPQUFPLENBQUMsR0FBRyxDQUFDO1VBQ04sR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsT0FBTzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0EwQnhCLENBQUMsQ0FBQztDQUNWO0tBQU07SUFDSCxNQUFNLE1BQU0sR0FBUTtRQUNoQixNQUFNLEVBQUUsZUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRztRQUM3QixFQUFFLEVBQUUsZUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixJQUFJLEVBQUUsZUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtRQUM1QixJQUFJLEVBQUUsZUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtRQUM1QixJQUFJLEVBQUUsZUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVztRQUNuQyxNQUFNLEVBQUUsZUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPO1FBQ3BDLE1BQU0sRUFBRSxDQUFDLENBQUMsZUFBSSxDQUFDLE1BQU07UUFDckIsR0FBRyxFQUFFLENBQUMsQ0FBQyxlQUFJLENBQUMsR0FBRztLQUNsQixDQUFDO0lBQ0YsaUJBQWlCO0lBQ2pCLE1BQU0sTUFBTSxHQUFHLEdBQUcsRUFBRTtRQUNoQixPQUFPLFdBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDaEMsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFO2dCQUNiLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQzthQUN6RTtZQUNELElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDbEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUN2QjtZQUNELE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQztJQUVGLCtEQUErRDtJQUMvRCxJQUFJLGVBQUksQ0FBQyxPQUFPLEVBQUU7UUFDZCxNQUFNLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNwQixPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3ZCLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQy9CLE9BQU8sTUFBTSxDQUFDLE9BQU8sSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDO1FBQ3hDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRTtZQUN6QixPQUFPLE1BQU0sRUFBRSxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxDQUFBO1FBRUYsbUNBQW1DO0tBQ3RDO1NBQU07UUFDSCxNQUFNLEVBQUUsQ0FBQTtLQUNYO0NBQ0oifQ==