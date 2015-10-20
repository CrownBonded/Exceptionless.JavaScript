import { NodeSubmissionAdapter } from './submission/NodeSubmissionAdapter';
import { SubmissionRequest } from './submission/SubmissionRequest';;

import * as stream from 'stream';
import { StringDecoder } from 'string_decoder';

var decoder = new StringDecoder('utf8');
var strings: string[] = [];

var jsonStream = new stream.Writable();
jsonStream._write = (chunk: Buffer|string, encoding: string, next: Function) => {
    strings.push(decoder.write(<Buffer>chunk));
    next();
};

jsonStream.on("finish", () => {
  var json = strings.join("");
  var request:SubmissionRequest = JSON.parse(json);
  var adapter = new NodeSubmissionAdapter();
  adapter.sendRequest(request, (status, message, data, headers) => {
    var result = {
      status,
      message,
      data,
      headers
    };
    process.stdout.write(JSON.stringify(result));
    process.exit(0);
  });
});

process.stdin.pipe(jsonStream);