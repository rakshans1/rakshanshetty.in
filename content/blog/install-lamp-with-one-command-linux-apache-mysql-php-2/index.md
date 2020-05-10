---
title: "Install LAMP with one command - Linux Apache MySQL PHP"
slug: "/install-lamp-with-one-command-linux-apache-mysql-php-2"
date: "2018-01-10T16:37:57.000Z"
description: ""
image: "./images/lamp.jpg"
featured: false
tags: ["Tutorials"]
---

This one line command tells Ubuntu to install lamp-server and phpmyadmin ( ^ means using tasksel), lamp-server is a set of applications to fully install apache, MySQL and php and set it up.

```shell
sudo apt-get install lamp-server^ phpmyadmin
```

This code does it all, then just follow the instructions:

- Confirm the download with yes.
- Setup the MySQL root password, then you will be asked, if you want to configure Apache or Lighthttpd, I choose Apache.
- When you are prompted with:
  _The phpmyadmin package must have a database installed and configured before it can be used. This can be optionally handled with dbconfig-common._
  Unless you know that it is not what you want to do, you should choose Yes.
- You will be then asked to set a phpmyadmin password with MySQL, leave it blank, a random password will be generated, it is a good security measure, you can not give up what you don't know :)

And .. it's done.

Entering http://localhost/phpmyadmin or http://your.public.ip.address/phpmyadmin should be working now and you must be able to log in entering your root credentials, user: root, password: root password you entered in second step.
