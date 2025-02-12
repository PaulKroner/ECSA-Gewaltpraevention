<?php
echo "Server Time: " . time();
$expirationTime = time() + 100; // 10 seconds in seconds
?>
<div>test</div>
<?php
echo $expirationTime - time();
?>