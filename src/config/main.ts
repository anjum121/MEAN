/**
 * Created by anjum on 06/05/17.
 */
const config = {

    //port
    port : process.env.PORT || 4000,

    //database config
    db : 'mongodb://localhost/jokesGitHub',

    //test environment
    test_env: 'test',
    test_db : 'mongodb://localhost/jokesGitHub-test',
    test_port : 3001,


};

export default config;