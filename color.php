<?php
$x1=-66;
$my_img = imagecreate( 40, 58 );
$background = imagecolorallocatealpha( $my_img, 204, 204, 204, 64);
$importimg = imagecreatefromgif('cloudy.gif');
imagecopy($my_img, $importimg, 0, 0, 0, 0, 40, 40);
$text_colour = imagecolorallocate( $my_img, 0, 0, 0 );
$t = "" . $x1 . "°C";

$dim = imageftbbox( 12, 0, "arial.ttf", $t );
print_r($dim);
$x = $dim[0] + 21 - ($dim[4] / 2);
$y = $dim[1] + 49 - ($dim[5] / 2);
echo $x;
echo "/" . $y;
echo "/" . $t;

imagefttext( $my_img, 12, 0, $x, $y, $text_colour, "arial.ttf", $t );
  
/*$background = imagecolorallocate( $my_img, 0, 0, 255 );
$text_colour = imagecolorallocate( $my_img, 255, 255, 0 );
$line_colour = imagecolorallocate( $my_img, 128, 255, 0 );
imagestring( $my_img, 4, 30, 25, "thesitewizard.com",
  $text_colour );
imagesetthickness ( $my_img, 5 );
imageline( $my_img, 30, 45, 165, 45, $line_colour );
*/
//header( "Content-type: image/png" );
imagepng( $my_img, "meteo/1.png" );
//imagecolordeallocate( $line_color );
imagecolordeallocate( $my_img, $text_colour );
imagecolordeallocate( $my_img, $background );
imagedestroy( $my_img );
imagedestroy( $importimg );
?>
