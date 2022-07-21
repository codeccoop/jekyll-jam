</main>
</div>
</body>

<script>
    <?php
    switch ($_SERVER['SCRIPT_NAME']) {
        case '/editor.php':
            include_once realpath(__DIR__ . '/../static/bundle/editor.js');
            break;
        case '':
            include_once realpath(__DIR__ . '/../static/bundle/home.js');
            break;
        default:
            include_once realpath(__DIR__ . '/../static/bundle/home.js');
    }
    ?>
</script>

</html>
