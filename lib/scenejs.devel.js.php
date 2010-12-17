<?php
	Header("content-type: application/x-javascript");

	$basedir = realpath(dirname(realpath(__FILE__)) . '/..') . '/';
	$SRC_DIR = $basedir . 'src/';

	$doc = simplexml_load_file($basedir . 'build.xml');

	foreach ($doc->path as $path)
		if ($path['id'] == 'sourcefiles')
		{
			foreach ($path->fileset as $fileset)
			{
				$dir = (string)$fileset['dir'];
				eval("\$dirPath = $dir;");
				$file = $dirPath . $fileset['includes'];
				if (file_exists($file))
					echo
							"// =================================================================================\n"
						.	"// === " . $fileset['includes'] . " ===\n"
						.	file_get_contents($file)
					;
			}
			break ;
		}
?>
