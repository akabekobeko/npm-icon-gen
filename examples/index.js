const icongen = require( 'icon-gen' );

icongen( '../test/data/sample.svg', './', { report: true } )
.then( ( results ) => {
  console.log( results );
} )
.catch( ( err ) => {
  console.error( err );
} );
