<?php

namespace Backend;


use Backend\Tables\Carbons;
use CarbonPHP\Abstracts\ColorCode;
use CarbonPHP\Application;
use CarbonPHP\CarbonPHP;
use CarbonPHP\Interfaces\iConfig;
use CarbonPHP\Programs\CLI;
use CarbonPHP\Rest;

class Documentation extends Application implements iConfig
{

    public function defaultRoute(): void
    {
        ColorCode::colorCode('Default route called.', ColorCode::CYAN);
        print 'Hello world!';
    }


    /**
     * todo - document well what can go into constructor and when.
     * way this will throw an error is if you do
     * not define a url using sockets.
     */
    public function __construct()
    {

        if (CarbonPHP::$safelyExit) {
            return;
        }

        global $json;

        if (!is_array($json)) {

            $json = array();

        }

        $json += [
            'SITE' => CarbonPHP::$site,
            'POST' => $_POST,
            'GET' => $_GET,
            'HTTP' => CarbonPHP::$http,
            'HTTPS' => CarbonPHP::$https,
            'SOCKET' => CarbonPHP::$socket,
            'AJAX' => CarbonPHP::$ajax,
            'SITE_TITLE' => CarbonPHP::$site_title,
            'CarbonPHP::$app_view' => CarbonPHP::$app_view,
            'COMPOSER' => CarbonPHP::CARBON_ROOT,
            'FACEBOOK_APP_ID' => ''
        ];

        parent::__construct();
    }

    public static function configuration(): array
    {
        if (CarbonPHP::$app_root === '/home/runner/work/carbonorm/reactboot') {

            CarbonPHP::$test = true;

            $databasePassword = 'password';

        } else if (CarbonPHP::$app_root === '/var/www/reactboot.com/') {

            CarbonPHP::$is_running_production = true;

            $databasePassword = 'goldteamrules';

        } else {

            $databasePassword = 'password';

        }

        return [
            CarbonPHP::REST => [
                CarbonPHP::NAMESPACE => Carbons::CLASS_NAMESPACE,
                CarbonPHP::TABLE_PREFIX => Carbons::TABLE_PREFIX
            ],
            CarbonPHP::DATABASE => [
                CarbonPHP::DB_HOST => CarbonPHP::$is_running_production ? '35.224.229.250' : '127.0.0.1',
                CarbonPHP::DB_PORT => '3306',
                CarbonPHP::DB_NAME => 'ReactBoot',                       // Schema
                CarbonPHP::DB_USER => 'root',                            // User
                CarbonPHP::DB_PASS => $databasePassword,                          // Password
                CarbonPHP::REBUILD => false
            ],
            CarbonPHP::SITE => [
                CarbonPHP::PROGRAM_DIRECTORIES => [
                    CLI::class
                ],
                CarbonPHP::URL => CarbonPHP::$is_running_production ? 'local.reactboot.com' : 'reactboot.com',    /* Evaluated and if not the accurate Redirect. Local php server okay. Remove for any domain */
                CarbonPHP::ROOT => CarbonPHP::$is_running_production,          /* This was defined in our ../index.php */
                CarbonPHP::CACHE_CONTROL => [
                    'ico|pdf|flv' => 'Cache-Control: max-age=29030400, public',
                    'jpg|jpeg|png|gif|swf|xml|txt|css|woff2|tff|ttf|svg' => 'Cache-Control: max-age=604800, public',
                    'html|htm|hbs|js' => 'Cache-Control: max-age=0, private, public',   // It is not recommended to add php as an extension as explicitly hitting the .php would output its contents without compilation.
                    // This can be a valid use, but for 99% of users it will seem like a bug with apache.
                ],
                CarbonPHP::CONFIG => __FILE__,               // Send to sockets
                CarbonPHP::TIMEZONE => 'America/Phoenix',    //  Current timezone
                CarbonPHP::TITLE => 'CarbonPHP • C6',        // Website title
                CarbonPHP::VERSION => trim(shell_exec('git describe --tags `git rev-list --tags --max-count=1`') ?? '0.0.0'),               // Add link to semantic versioning
                CarbonPHP::SEND_EMAIL => 'example@example.com',
                CarbonPHP::REPLY_EMAIL => 'example@example.com',
                CarbonPHP::HTTP => true, //CarbonPHP::$app_local
            ],
            CarbonPHP::SESSION => [
                CarbonPHP::REMOTE => true,             // Store the session in the SQL database
                # CarbonPHP::SERIALIZE => [ ],           // These global variables will be stored between session
                # CarbonPHP::PATH => ''
                CarbonPHP::CALLBACK => static function () {         // optional variable $reset which would be true if a url is passed to startApplication()
                    // optional variable $reset which would be true if a url is passed to startApplication()
                    // This is a special case used for documentation and should not be used in prod. See repo stats.coach for example
                    /*if ($_SESSION['id'] ??= false) {
                        self::getUser(session_id());       // todo - opted for the run in self::defaultRoute &| self::startApplication
                    }*/
                },
            ],
            CarbonPHP::SOCKET => [
                CarbonPHP::WEBSOCKETD => false,
                CarbonPHP::PORT => 8888,
                CarbonPHP::DEV => true,
                CarbonPHP::SSL => [
                    CarbonPHP::KEY => '',
                    CarbonPHP::CERT => ''
                ]
            ],
            // ERRORS on point
            CarbonPHP::ERROR => [
                CarbonPHP::LOCATION => CarbonPHP::$app_root . 'logs' . DIRECTORY_SEPARATOR,
                CarbonPHP::LEVEL => E_ALL | E_STRICT,  // php ini level
                CarbonPHP::STORE => false,      // Database if specified and / or File 'LOCATION' in your system
                CarbonPHP::SHOW => true,       // Show errors on browser
                CarbonPHP::FULL => true        // Generate custom stacktrace will high detail - DO NOT set to TRUE in PRODUCTION
            ],
            CarbonPHP::VIEW => [
                // TODO - THIS IS USED AS A URL AND DIRECTORY PATH. THIS IS BAD. WE NEED DS
                CarbonPHP::VIEW => 'view/',  // This is where the MVC() function will map the HTML.PHP and HTML.HBS . See Carbonphp.com/mvc
                CarbonPHP::WRAPPER => null,     // View::content() will produce this
            ],
        ];
    }

    public function startApplication(string $uri): bool
    {

        if (Rest::MatchRestfulRequests('', Carbons::CLASS_NAMESPACE)) {
            return true;
        }

        $method = __METHOD__;

        if (self::regexMatch(/** @lang PhpRegExp */ '#.*#', static function () use ($method){

            print $method;

        })) {

            return true;

        }

        return false;

    }

}