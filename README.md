TO DO:


find a way to close mongodb connection after exiting npm run dev

https://stackoverflow.com/questions/37571997/nodejs-run-command-when-script-is-terminated

https://docs.mongodb.com/manual/tutorial/write-scripts-for-the-mongo-shell/

 





=======


you'll need to first install the mongodb community edition locally:

https://docs.mongodb.com/manual/administration/install-community/


You can use MongoDB Compass to see whats happening in your database:

https://www.mongodb.com/products/compass


run:

`$ npm run dev`


when you've finished run:

`$ brew services stop mongodb-community@4.4`

