class must-have {
  include apt

  apt::ppa { "ppa:chris-lea/node.js": }

  exec { 'apt-get update':
    command => '/usr/bin/apt-get update',
    before => Apt::Ppa["ppa:chris-lea/node.js"],
  }

  exec { 'apt-get update 2':
    command => '/usr/bin/apt-get update',
    require => Apt::Ppa["ppa:chris-lea/node.js"],
  }

  exec { 'install gem jekyll':
    command => '/opt/ruby/bin/gem install jekyll',
    creates => "/opt/ruby/bin/jekyll",
    require => Exec["apt-get update 2"],
  }

  exec { 'install grunt':
    command => '/usr/bin/npm install -g grunt-cli',
    creates => [
      '/usr/lib/node_modules/grunt-cli/bin/grunt'
    ],
    require => [ Exec["apt-get update 2"], Package["nodejs"] ],
  }

  package {["build-essential", "bash", "nodejs", "git-core"]:
    ensure => present,
    require => Exec["apt-get update 2"],
  }
}

include must-have
