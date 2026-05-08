// src/seedPlayersAll.js
require("dotenv").config();
const mongoose = require("mongoose");
const Team = require("./models/Team");
const Player = require("./models/Player");

const LEAGUE = "Süper Lig";

/**
 * CSV'yi buraya gömüyoruz (tek dosya isteğine uygun)
 * - Header dahil
 * - Satırlar: Takım,İsim Soyisim,Pozisyon,Yaş
 */
const CSV = `
Takım,İsim Soyisim,Pozisyon,Yaş
Galatasaray SK,Uğurcan Çakır,KL,29
Galatasaray SK,Günay Güvenç,KL,34
Galatasaray SK,Batuhan Ahmet Şen,KL,26
Galatasaray SK,Davinson Sánchez,DEF,29
Galatasaray SK,Abdülkerim Bardakcı,DEF,31
Galatasaray SK,Kaan Ayhan,DEF,31
Galatasaray SK,Ismail Jakobs,DEF,26
Galatasaray SK,Wilfried Stephane Singo,DEF,24
Galatasaray SK,Eren Elmalı,DEF,25
Galatasaray SK,Kazımcan Karataş,DEF,22
Galatasaray SK,Metehan Baltacı,DEF,23
Galatasaray SK,Arda Ünyay,DEF,18
Galatasaray SK,Lucas Torreira,OS,29
Galatasaray SK,İlkay Gündoğan,OS,35
Galatasaray SK,Mario Lemina,OS,32
Galatasaray SK,Gabriel Davi Gomes Sara,OS,26
Galatasaray SK,Berkan Kutlu,OS,27
Galatasaray SK,Mauro Icardi,FVT,32
Galatasaray SK,Victor Osimhen,FVT,26
Galatasaray SK,Leroy Aziz Sané,FVT,29
Galatasaray SK,Roland Sallai,FVT,28
Galatasaray SK,Barış Alper Yılmaz,FVT,25
Galatasaray SK,Yunus Akgün,FVT,25
Galatasaray SK,Ahmed Kutucu,FVT,25
Galatasaray SK,Yusuf Demir,FVT,22
Fenerbahçe SK,Ederson,KL,32
Fenerbahçe SK,İrfan Can Eğribayat,KL,27
Fenerbahçe SK,Tarık Çetin,KL,28
Fenerbahçe SK,Milan Škriniar,DEF,30
Fenerbahçe SK,Jayden Oosterwolde,DEF,24
Fenerbahçe SK,Archie Brown,DEF,23
Fenerbahçe SK,Mert Müldür,DEF,26
Fenerbahçe SK,Levent Mercan,DEF,25
Fenerbahçe SK,Çağlar Söyüncü,DEF,29
Fenerbahçe SK,Edson Álvarez,OS,28
Fenerbahçe SK,İsmail Yüksek,OS,26
Fenerbahçe SK,Fred,OS,32
Fenerbahçe SK,Sebastian Szymański,OS,26
Fenerbahçe SK,Anderson Talisca,OS,31
Fenerbahçe SK,Kerem Aktürkoğlu,OS,27
Fenerbahçe SK,Marco Asensio,OS,30
Fenerbahçe SK,Oğuz Aydın,FVT,25
Fenerbahçe SK,Dorgeles Nene,FVT,22
Fenerbahçe SK,Youssef En-Nesyri,FVT,28
Fenerbahçe SK,Jhon Durán,FVT,26
Beşiktaş JK,Mert Günok,KL,36
Beşiktaş JK,Ersin Destanoğlu,KL,24
Beşiktaş JK,Emre Bilgin,KL,21
Beşiktaş JK,Gabriel Paulista,DEF,35
Beşiktaş JK,Tiago Djaló,DEF,25
Beşiktaş JK,Felix Uduokhai,DEF,28
Beşiktaş JK,Jonas Svensson,DEF,32
Beşiktaş JK,Rıdvan Yılmaz,DEF,24
Beşiktaş JK,David Jurásek,DEF,25
Beşiktaş JK,Emirhan Topçu,DEF,25
Beşiktaş JK,Necip Uysal,OS/DEF,34
Beşiktaş JK,Orkun Kökçü,OS,24
Beşiktaş JK,Salih Uçan,OS,34
Beşiktaş JK,Wilfred Ndidi,OS,28
Beşiktaş JK,Václav Černý,OS,28
Beşiktaş JK,Milot Rashica,OS/FVT,29
Beşiktaş JK,Cengiz Ünder,OS/FVT,28
Beşiktaş JK,Rafa Silva,FVT,33
Beşiktaş JK,Tammy Abraham,FVT,28
Beşiktaş JK,El Bilal Touré,FVT,25
Beşiktaş JK,Jota Silva,FVT,26
Trabzonspor AŞ,André Onana,KL,29
Trabzonspor AŞ,Onuralp Çevikkan,KL,25
Trabzonspor AŞ,Ahmet Doğan Yıldırım,KL,21
Trabzonspor AŞ,Erol Can Colak,KL,20
Trabzonspor AŞ,Stefan Savić,DEF,34
Trabzonspor AŞ,Arseniy Batagov,DEF,23
Trabzonspor AŞ,Mustafa Eskihellaç,DEF,28
Trabzonspor AŞ,Serdar Saatçı,DEF,22
Trabzonspor AŞ,Rayyan Baniya,DEF,24
Trabzonspor AŞ,Arda Öztürk,DEF,20
Trabzonspor AŞ,Arif Boşluk,DEF,21
Trabzonspor AŞ,Taha Emre Ince,DEF,22
Trabzonspor AŞ,Ernest Muçi,OS,24
Trabzonspor AŞ,Benjamin Bouchouari,OS,24
Trabzonspor AŞ,Ozan Tufan,OS,30
Trabzonspor AŞ,Christ Inao Oulaï,OS,24
Trabzonspor AŞ,Oleksandr Zubkov,OS,29
Trabzonspor AŞ,Edin Višća,OS,35
Trabzonspor AŞ,Okay Yokuşlu,OS,31
Trabzonspor AŞ,Anthony Nwakaeme,OS,36
Trabzonspor AŞ,Cihan Çanak,OS,21
Trabzonspor AŞ,Wagner Pina,OS,26
Trabzonspor AŞ,Tim Jabol-Folcarelli,OS,26
Trabzonspor AŞ,Salih Malkoçoğlu,OS,21
Trabzonspor AŞ,Boran Başkan,OS,20
Trabzonspor AŞ,Paul Onuachu,FVT,31
Trabzonspor AŞ,Danylo Sikan,FVT,24
Trabzonspor AŞ,Felipe Augusto,FVT,24
Trabzonspor AŞ,Kazeem Olaigbe,FVT,22
Trabzonspor AŞ,Esat Yiğit Alkurt,FVT,20
Göztepe AŞ,Mateusz Lis,KL,30
Göztepe AŞ,Ekrem Kılıçarslan,KL,29
Göztepe AŞ,Nevzat Tan Uzel,KL,20
Göztepe AŞ,Amine Cherni,DEF,24
Göztepe AŞ,Malcom Bokele,DEF,25
Göztepe AŞ,Arda Kurtulan,DEF,22
Göztepe AŞ,Héliton,DEF,30
Göztepe AŞ,Taha Altıkardeş,DEF,22
Göztepe AŞ,Ruan,DEF,28
Göztepe AŞ,Uğur Kaan Yıldız,DEF,23
Göztepe AŞ,Allan,DEF,26
Göztepe AŞ,Furkan Bayır,DEF,25
Göztepe AŞ,Ege Yildirim,DEF,20
Göztepe AŞ,Novatus Miroshi,OS,23
Göztepe AŞ,Junior Olaitan,OS,23
Göztepe AŞ,Anthony Junior Dennis,OS,22
Göztepe AŞ,Rhaldney,OS,27
Göztepe AŞ,Efkan Bekiroğlu,OS,30
Göztepe AŞ,İsmail Köybaşı,OS,36
Göztepe AŞ,Ahmed Ildız,OS,29
Göztepe AŞ,Ogün Bayrak,OS,27
Göztepe AŞ,Juan Santos da Silva,FVT,28
Göztepe AŞ,Janderson,FVT,26
Göztepe AŞ,Ibrahim Sabra,FVT,24
Göztepe AŞ,Salem Bouajila,FVT,23
Göztepe AŞ,Tibet Durakcay,FVT,20
Samsunspor AŞ,Albert Posiadała,KL,30
Samsunspor AŞ,Okan Kocuk,KL,30
Samsunspor AŞ,Efe Berat Törüz,KL,19
Samsunspor AŞ,Efe Yiğit Üstün,KL,19
Samsunspor AŞ,Rick Van Drongelen,DEF,26
Samsunspor AŞ,Ľubomír Šatka,DEF,30
Samsunspor AŞ,Josafat Mendes,DEF,23
Samsunspor AŞ,Toni Borevković,DEF,28
Samsunspor AŞ,Logi Tomasson,DEF,25
Samsunspor AŞ,Zeki Yavru,DEF,34
Samsunspor AŞ,Yunus Emre Çift,DEF,22
Samsunspor AŞ,Bedirhan Çetin,DEF,21
Samsunspor AŞ,Soner Gönül,DEF,31
Samsunspor AŞ,Eyüp Aydın,OS,21
Samsunspor AŞ,Olivier Ntcham,OS,29
Samsunspor AŞ,Carlo Holse,OS,26
Samsunspor AŞ,Afonso Sousa,OS,25
Samsunspor AŞ,Antoine Makoumbou,OS,27
Samsunspor AŞ,Tanguy Coulibaly,OS,25
Samsunspor AŞ,Emre Kılınç,OS,31
Samsunspor AŞ,Soner Aydoğdu,OS,34
Samsunspor AŞ,Celil Yüksel,OS,28
Samsunspor AŞ,Franck Atoen,OS,21
Samsunspor AŞ,Eyup Degirmenci,OS,20
Samsunspor AŞ,Cherif Ndiaye,FVT,29
Samsunspor AŞ,Marius Mouandilmadji,FVT,27
Samsunspor AŞ,Anthony Musaba,FVT,25
Samsunspor AŞ,Richie Omorowa,FVT,21
Samsunspor AŞ,Ebrima Ceesay,FVT,20
Samsunspor AŞ,Polat Yaldır,FVT,22
Samsunspor AŞ,Tahsin Bulbul,FVT,19
Gaziantep FK,Mustafa Burak Bozan,KL,29
Gaziantep FK,Zafer Görgen,KL,25
Gaziantep FK,Tayyip Talha Sanuç,DEF,26
Gaziantep FK,Myenty Abena,DEF,30
Gaziantep FK,Kévin Rodrigues,DEF,31
Gaziantep FK,Luis Pérez,DEF,32
Gaziantep FK,Arda Kızıldağ,DEF,27
Gaziantep FK,Semih Güler,DEF,31
Gaziantep FK,Rob Nizet,DEF,23
Gaziantep FK,Salem M'Bakata,DEF,27
Gaziantep FK,Kacper Kozłowski,OS,22
Gaziantep FK,Alexandru Maxim,OS,35
Gaziantep FK,Deian Sorescu,OS,28
Gaziantep FK,Juninho Bacuna,OS,28
Gaziantep FK,Badou Ndiaye,OS,35
Gaziantep FK,Yusuf Kabadayi,OS,21
Gaziantep FK,Drissa Camara,OS,24
Gaziantep FK,Enver Kulašin,OS,22
Gaziantep FK,Nazım Sangaré,OS,34
Gaziantep FK,Melih Kabasakal,OS,29
Gaziantep FK,Ogün Özçiçek,OS,28
Gaziantep FK,Muhammet Taha Gunes,OS,20
Gaziantep FK,Kuzey Bulgulu,OS,20
Gaziantep FK,Berke Özçelik,OS,21
Gaziantep FK,Mohamed Bayo,FVT,27
Gaziantep FK,Emmanuel Boateng,FVT,31
Gaziantep FK,Christophe Lungoyi,FVT,25
Gaziantep FK,Mehmet Kuzucu,FVT,21
Gaziantep FK,Ali Osman Kalın,FVT,20
Gaziantep FK,Ali Mevran Ablak,FVT,19
Kocaelispor,Aleksandar Jovanović,KL,33
Kocaelispor,Gökhan Değirmenci,KL,36
Kocaelispor,Serhat Öztaşdelen,KL,21
Kocaelispor,Mateusz Wieteska,DEF,28
Kocaelispor,Botond Balogh,DEF,23
Kocaelispor,Hrvoje Smolčić,DEF,25
Kocaelispor,Massadio Haïdara,DEF,33
Kocaelispor,Anfernee Dijksteel,DEF,29
Kocaelispor,Oleksandr Syrota,DEF,29
Kocaelispor,Ahmet Oğuz,DEF,32
Kocaelispor,Tarkan Serbest,DEF,31
Kocaelispor,Muharrem Cinan,DEF,27
Kocaelispor,Muhammed Efe Küçük,DEF,19
Kocaelispor,Karol Linetty,OS,30
Kocaelispor,Joseph Nonge,OS,20
Kocaelispor,Show,OS,26
Kocaelispor,Darko Churlinov,OS,25
Kocaelispor,Tayfur Bingöl,OS,32
Kocaelispor,Habib Keita,OS,23
Kocaelispor,Rigoberto Rivas,OS,27
Kocaelispor,Samet Yalçın,OS,29
Kocaelispor,Bunyamin Dalkilic,OS,20
Kocaelispor,Esat Yusuf Narin,OS,21
Kocaelispor,Bruno Petković,FVT,31
Kocaelispor,Serdar Dursun,FVT,34
Kocaelispor,Can Keleş,FVT,24
Kocaelispor,Daniel Agyei,FVT,28
Kocaelispor,Ahmet Sağat,FVT,31
Kocaelispor,Furkan Gedik,FVT,22
Alanyaspor,Paulo Victor,KL,28
Alanyaspor,Ertuğrul Taşkıran,KL,36
Alanyaspor,Mert Furkan Bayram,KL,21
Alanyaspor,Ümit Akdağ,DEF,25
Alanyaspor,Florent Hadergjonaj,DEF,31
Alanyaspor,Fidan Aliti,DEF,32
Alanyaspor,Bruno Viana,DEF,30
Alanyaspor,Nuno Lima,DEF,27
Alanyaspor,Fatih Aksoy,DEF,28
Alanyaspor,Baran Mogultay,DEF,22
Alanyaspor,Batuhan Yavuz,DEF,20
Alanyaspor,Bedirhan Özyurt,DEF,22
Alanyaspor,Semih Doganay,DEF,20
Alanyaspor,Ianis Hagi,OS,27
Alanyaspor,Maestro,OS,27
Alanyaspor,Gaius Makouta,OS,28
Alanyaspor,Yusuf Özdemir,OS,25
Alanyaspor,Ruan,OS,28
Alanyaspor,Efecan Karaca,OS,36
Alanyaspor,Nicolas Janvier,OS,27
Alanyaspor,Ibrahim Kaya,OS,20
Alanyaspor,İzzet Çelik,OS,24
Alanyaspor,Enes Keskin,OS,24
Alanyaspor,Buluthan Bulut,OS,21
Alanyaspor,Yusuf Karademir,OS,20
Alanyaspor,Meschack Elia,FVT,28
Alanyaspor,Steve Mounié,FVT,31
Alanyaspor,Ui-Jo Hwang,FVT,33
Alanyaspor,Uchenna Ogundu,FVT,21
Alanyaspor,Güven Yalçın,FVT,26
Alanyaspor,Huseyin Sen,FVT,20
Konyaspor,Deniz Ertaş,KL,20
Konyaspor,Bahadır Han Güngördü,KL,29
Konyaspor,Egemen Aydin,KL,20
Konyaspor,Riechedly Bazoer,DEF,29
Konyaspor,Guilherme Haubert Sityá,DEF,35
Konyaspor,Yhoan Andzouana,DEF,29
Konyaspor,Adil Demirbağ,DEF,28
Konyaspor,Uğurcan Yazğılı,DEF,26
Konyaspor,Josip Ćalušić,DEF,31
Konyaspor,Yasir Subaşı,DEF,30
Konyaspor,Muzaffer Utku Eriş,DEF,20
Konyaspor,Enis Bardhi,OS,30
Konyaspor,Jo Jin-ho,OS,25
Konyaspor,Marius Ștefănescu,OS,27
Konyaspor,Pedrinho,OS,28
Konyaspor,Morten Bjorlo,OS,29
Konyaspor,Melih İbrahimoğlu,OS,25
Konyaspor,Marko Jevtović,OS,35
Konyaspor,Mücahit Ibrahimoglu,OS,23
Konyaspor,Ufuk Akyol,OS,28
Konyaspor,Jackson Muleka,FVT,26
Konyaspor,Umut Nayir,FVT,32
Konyaspor,Melih Bostan,FVT,21
Konyaspor,Muhammet Tunahan Taşçı,FVT,20
Konyaspor,Kaan Akyazı,FVT,20
Çaykur Rizespor AŞ,Yahia Fofana,KL,25
Çaykur Rizespor AŞ,Erdem Canpolat,KL,25
Çaykur Rizespor AŞ,Efe Doğan,KL,20
Çaykur Rizespor AŞ,Husniddin Alikulov,DEF,28
Çaykur Rizespor AŞ,Samet Akaydın,DEF,31
Çaykur Rizespor AŞ,Modibo Sagnan,DEF,26
Çaykur Rizespor AŞ,Attila Mocsi,DEF,25
Çaykur Rizespor AŞ,Taha Şahin,DEF,25
Çaykur Rizespor AŞ,Casper Højer,DEF,31
Çaykur Rizespor AŞ,Mithat Pala,DEF,27
Çaykur Rizespor AŞ,Furkan Orak,DEF,22
Çaykur Rizespor AŞ,Valentin Mihăilă,OS,25
Çaykur Rizespor AŞ,Loide Augusto,OS,25
Çaykur Rizespor AŞ,Jesurun Rak-Sakyi,OS,23
Çaykur Rizespor AŞ,Qazim Laci,OS,29
Çaykur Rizespor AŞ,Ibrahim Olawoyin,OS,29
Çaykur Rizespor AŞ,Taylan Antalyalı,OS,30
Çaykur Rizespor AŞ,Giannis Papanikolaou,OS,29
Çaykur Rizespor AŞ,Muhamed Buljubašić,OS,23
Çaykur Rizespor AŞ,Altin Zeqiri,OS,25
Çaykur Rizespor AŞ,Janne-Pekka Laine,OS,26
Çaykur Rizespor AŞ,Ali Sowe,FVT,31
Çaykur Rizespor AŞ,Halil Dervişoğlu,FVT,26
Çaykur Rizespor AŞ,Václav Jurečka,FVT,31
Çaykur Rizespor AŞ,Emrecan Bulut,FVT,22
Antalyaspor,Julián Cuesta,KL,34
Antalyaspor,Ataberk Dadakdeniz,KL,26
Antalyaspor,Abdullah Yiğiter,KL,25
Antalyaspor,Kağan Arıcan,KL,21
Antalyaspor,Sadullah Yiğit Kabakuşak,KL,20
Antalyaspor,Batuhan Eroğlu,KL,19
Antalyaspor,Lautaro Giannetti,DEF,32
Antalyaspor,Georgiy Dzhikiya,DEF,32
Antalyaspor,Kenneth Paal,DEF,28
Antalyaspor,Bünyamin Balcı,DEF,25
Antalyaspor,Hüseyin Türkmen,DEF,28
Antalyaspor,Veysel Sarı,DEF,37
Antalyaspor,Erdoğan Yeşilyurt,DEF,32
Antalyaspor,Samet Karakoc,DEF,24
Antalyaspor,Bahadır Öztürk,DEF,33
Antalyaspor,Ege Izmirli,DEF,19
Antalyaspor,Efecan Gülerce,DEF,20
Antalyaspor,Alp Ada Abay,DEF,21
Antalyaspor,Muhammed Emin Ozkul,DEF,20
Antalyaspor,Alp Abay,DEF,21
Antalyaspor,Ensar Buğra Tivsiz,DEF,20
Antalyaspor,Ozkan Kuray,DEF,21
Antalyaspor,Abdülkadir Ömür,OS,26
Antalyaspor,Dario Šarić,OS,28
Antalyaspor,Jesper Ceesay,OS,27
Antalyaspor,Sander van de Streek,OS,32
Antalyaspor,Hasan Yakub İlçin,OS,21
Antalyaspor,Doğukan Sinik,OS,27
Antalyaspor,Ramzi Safuri,OS,30
Antalyaspor,Soner Dikmen,OS,32
Antalyaspor,Tomáš Čvančara,FVT,27
Antalyaspor,Poyraz Efe Yıldırım,FVT,21
Antalyaspor,Nikola Storm,FVT,31
Antalyaspor,Yohan Boli,FVT,32
Antalyaspor,Samuel Ballet,FVT,24
Antalyaspor,Bachir Gueye,FVT,24
Antalyaspor,Kerem Kayaarasi,FVT,20
Antalyaspor,Ali Demirbilek,FVT,20
Antalyaspor,Berkay Topdemir,FVT,20
Antalyaspor,Arda Altun,FVT,21
Kasımpaşa SK,Andreas Gianniotis,KL,32
Kasımpaşa SK,Ali Emre Yanar,KL,28
Kasımpaşa SK,Ege Albayrak,KL,20
Kasımpaşa SK,Şant Kazancı,KL,19
Kasımpaşa SK,Attila Szalai,DEF,29
Kasımpaşa SK,Nicholas Opoku,DEF,29
Kasımpaşa SK,Adem Arous,DEF,28
Kasımpaşa SK,Cláudio Winck,DEF,31
Kasımpaşa SK,Godfried Frimpong,DEF,26
Kasımpaşa SK,Jhon Espinoza,DEF,26
Kasımpaşa SK,Emre Taşdemir,DEF,30
Kasımpaşa SK,Taylan Utku Aydın,DEF,21
Kasımpaşa SK,Berkay Muratoğlu,DEF,20
Kasımpaşa SK,Yunus Emre Atakaya,DEF,19
Kasımpaşa SK,Haris Hajradinović,OS,31
Kasımpaşa SK,Mortadha Ben Ouanes,OS,31
Kasımpaşa SK,Fousseni Diabaté,OS,30
Kasımpaşa SK,Andri Baldursson,OS,23
Kasımpaşa SK,Cafú,OS,32
Kasımpaşa SK,Ali Yavuz Kol,OS,26
Kasımpaşa SK,Cem Üstündag,OS,24
Kasımpaşa SK,Erdem Çetinkaya,OS,29
Kasımpaşa SK,Atakan Mujde,OS,21
Kasımpaşa SK,Oguzhan Yilmaz,OS,21
Kasımpaşa SK,Pape Habib Gueye,FVT,26
Kasımpaşa SK,Yusuf Barası,FVT,22
Kasımpaşa SK,Kubilay Kanatsızkuş,FVT,28
Kasımpaşa SK,Yasin Eratilla,FVT,20
Kasımpaşa SK,Mamadou Fall,FVT,34
Eyüpspor,Marcos Felipe,KL,29
Eyüpspor,Jankat Yılmaz,KL,21
Eyüpspor,Cengiz Alp Köseer,KL,20
Eyüpspor,Nihad Mujakić,DEF,27
Eyüpspor,Calegari,DEF,28
Eyüpspor,Emir Ortakaya,DEF,21
Eyüpspor,Umut Meraş,DEF,30
Eyüpspor,Luccas Claro,DEF,34
Eyüpspor,Robin Yalçın,DEF,31
Eyüpspor,Gilbert Mendy,DEF,22
Eyüpspor,Talha Ülvan,DEF,24
Eyüpspor,Talha Ulvan,DEF,24
Eyüpspor,Berhan Satli,DEF,20
Eyüpspor,Burak Isik,DEF,20
Eyüpspor,Ömer Bedri Kara,DEF,20
Eyüpspor,Kerem Demirbay,OS,32
Eyüpspor,Mateusz Łęgowski,OS,22
Eyüpspor,Svit Sešlar,OS,25
Eyüpspor,Emre Akbaba,OS,33
Eyüpspor,Taras Stepanenko,OS,36
Eyüpspor,Prince Ampem,OS,27
Eyüpspor,Halil Akbunar,OS,32
Eyüpspor,Samu Sáiz,OS,34
Eyüpspor,Serdar Gürler,OS,34
Eyüpspor,Baran Ali Gezek,OS,20
Eyüpspor,Taşkın Ilter,OS,31
Eyüpspor,Yalçın Kayan,OS,26
Eyüpspor,Christ Sadia,OS,21
Eyüpspor,Can Bayırkan,OS,20
Eyüpspor,Denis Drăguş,FVT,26
Eyüpspor,Mame Thiam,FVT,33
Eyüpspor,Umut Bozok,FVT,29
Eyüpspor,Metehan Altunbaş,FVT,25
Kayserispor,Deniz Eren Donmezer,KL,20
Kayserispor,Bilal Bayazit,KL,26
Kayserispor,Onurcan Piri,KL,30
Kayserispor,Mehmet Şamil Öztürk,KL,20
Kayserispor,Majid Hosseini,DEF,32
Kayserispor,Stefano Denswil,DEF,32
Kayserispor,Lionel Carole,DEF,34
Kayserispor,Arif Kocaman,DEF,25
Kayserispor,Gideon Jung,DEF,31
Kayserispor,Kayra Cihan,DEF,21
Kayserispor,Abdulsamet Burak,DEF,24
Kayserispor,Enes Gökcek,DEF,20
Kayserispor,László Bénes,OS,28
Kayserispor,Burak Kapacak,OS,26
Kayserispor,Youssef Aït Bennasser,OS,29
Kayserispor,Carlos Mané,OS,31
Kayserispor,Miguel Cardoso,OS,31
Kayserispor,João Mendes,OS,29
Kayserispor,Dorukhan Toköz,OS,29
Kayserispor,Yaw Ackah,OS,26
Kayserispor,Ramazan Civelek,OS,30
Kayserispor,Furkan Soyalp,OS,30
Kayserispor,Yiğit Emre Çeltik,OS,24
Kayserispor,Mehmet Eray Özbek,OS,20
Kayserispor,Muhammet Yasar,OS,20
Kayserispor,German Onugkha,FVT,29
Kayserispor,Indrit Tuci,FVT,25
Kayserispor,Aaron Opoku,FVT,26
Kayserispor,Talha Sariarslan,FVT,20
Kayserispor,Nurettin Korkmaz,FVT,23
Kayserispor,Berkan Aslan,FVT,20
Fatih Karagümrük SK,Ivo Grbić,KL,29
Fatih Karagümrük SK,Furkan Bekleviç,KL,28
Fatih Karagümrük SK,Kerem Yandal,KL,21
Fatih Karagümrük SK,Berke Can Evli,KL,20
Fatih Karagümrük SK,Ricardo Esgaio,DEF,32
Fatih Karagümrük SK,Enzo Roco,DEF,33
Fatih Karagümrük SK,Jure Balkovec,DEF,31
Fatih Karagümrük SK,Çağtay Kurukalıp,DEF,25
Fatih Karagümrük SK,Nikoloz Ugrekhelidze,DEF,23
Fatih Karagümrük SK,Atakan Çankaya,DEF,27
Fatih Karagümrük SK,Anıl Yiğit Çınar,DEF,20
Fatih Karagümrük SK,Burhan Ersoy,DEF,21
Fatih Karagümrük SK,Muhammed Kadıoğlu,DEF,20
Fatih Karagümrük SK,Matías Kranevitter,OS,32
Fatih Karagümrük SK,Marius Tresor Doh,OS,23
Fatih Karagümrük SK,Serginho,OS,31
Fatih Karagümrük SK,Sam Larsson,OS,32
Fatih Karagümrük SK,Berkay Özcan,OS,27
Fatih Karagümrük SK,Daniel Johnson,OS,33
Fatih Karagümrük SK,Alper Demirol,OS,24
Fatih Karagümrük SK,João Camacho,OS,31
Fatih Karagümrük SK,Baris Kalayci,OS,20
Fatih Karagümrük SK,Tuğbey Akgün,OS,23
Fatih Karagümrük SK,Ömer Faruk Gümüş,OS,20
Fatih Karagümrük SK,Kerem Ozmen,OS,20
Fatih Karagümrük SK,David Datro Fofana,FVT,23
Fatih Karagümrük SK,Andre Gray,FVT,34
Fatih Karagümrük SK,Tiago Çukur,FVT,23
Fatih Karagümrük SK,Tarik Bugra Kalpakli,FVT,20
Fatih Karagümrük SK,Ahmet Sivri,FVT,29
Fatih Karagümrük SK,Tiago Cukur,FVT,23
Fatih Karagümrük SK,Enes Can Olcay,FVT,20
Başakşehir FK,Doğan Alemdar,KL,23
Başakşehir FK,Muhammed Şengezer,KL,28
Başakşehir FK,Volkan Babacan,KL,37
Başakşehir FK,Luca Stancic,KL,20
Başakşehir FK,Jerome Opoku,DEF,27
Başakşehir FK,Christopher Operi,DEF,28
Başakşehir FK,Onur Bulut,DEF,32
Başakşehir FK,Festy Ebosele,DEF,26
Başakşehir FK,Léo Duarte,DEF,29
Başakşehir FK,Ousseynou Ba,DEF,28
Başakşehir FK,Hamza Güreler,DEF,20
Başakşehir FK,Ömer Ali Şahiner,DEF,34
Başakşehir FK,Abbosbek Fayzullaev,OS,22
Başakşehir FK,Amine Harit,OS,28
Başakşehir FK,Jakub Kałuziński,OS,23
Başakşehir FK,Miguel Crespo,OS,29
Başakşehir FK,Olivier Kemen,OS,29
Başakşehir FK,Yusuf Sarı,OS,27
Başakşehir FK,Ömer Faruk Beyaz,OS,22
Başakşehir FK,Ivan Brnić,OS,24
Başakşehir FK,Deniz Türüç,OS,32
Başakşehir FK,Berat Ayberk Özdemir,OS,27
Başakşehir FK,Umut Güneş,OS,25
Başakşehir FK,Onur Ergün,OS,33
Başakşehir FK,Eldor Shomurodov,FVT,30
Başakşehir FK,Bertuğ Yıldırım,FVT,23
Başakşehir FK,Davie Selke,FVT,30
Başakşehir FK,Nuno Da Costa,FVT,34
Başakşehir FK,Berkay Aslan,FVT,20
Gençlerbirliği SK,Ricardo Velho,KL,30
Gençlerbirliği SK,Gökhan Akkan,KL,30
Gençlerbirliği SK,Erhan Erentürk,KL,30
Gençlerbirliği SK,Ebrar Yigit Aydin,KL,21
Gençlerbirliği SK,Berk Deniz Çukurcu,KL,20
Gençlerbirliği SK,Dimitris Goutas,DEF,32
Gençlerbirliği SK,Thalisson Kelven,DEF,27
Gençlerbirliği SK,Žan Žužek,DEF,27
Gençlerbirliği SK,Matěj Hanousek,DEF,32
Gençlerbirliği SK,Abdurrahim Dursun,DEF,32
Gençlerbirliği SK,Sinan Osmanoğlu,DEF,35
Gençlerbirliği SK,Firatcan Üzüm,DEF,28
Gençlerbirliği SK,Yiğit Hamza Aydar,DEF,20
Gençlerbirliği SK,Emirhan Ünal,DEF,21
Gençlerbirliği SK,Abdullah Sahindere,DEF,24
Gençlerbirliği SK,Umut Islamoglu,DEF,21
Gençlerbirliği SK,Kevin Csoboth,OS,25
Gençlerbirliği SK,Franco Tongya,OS,23
Gençlerbirliği SK,Oghenekaro Etebo,OS,30
Gençlerbirliği SK,Dal Varešanović,OS,24
Gençlerbirliği SK,Pedro Pereira,OS,27
Gençlerbirliği SK,Göktan Gürpüz,OS,23
Gençlerbirliği SK,Tom Dele-Bashiru,OS,26
Gençlerbirliği SK,Moussa Kyabou,OS,27
Gençlerbirliği SK,Oğulcan Ülgün,OS,27
Gençlerbirliği SK,Metehan Mimaroğlu,OS,31
Gençlerbirliği SK,Samed Onur,OS,23
Gençlerbirliği SK,Ensar Kemaloğlu,OS,21
Gençlerbirliği SK,Mehmet Akbal,OS,20
Gençlerbirliği SK,Hulisi Destici,OS,20
Gençlerbirliği SK,Elias Durmaz,OS,22
Gençlerbirliği SK,Sekou Koita,FVT,27
Gençlerbirliği SK,M'Baye Niang,FVT,31
Gençlerbirliği SK,Henry Onyekuru,FVT,28
Gençlerbirliği SK,Furkan Ayaz,FVT,20
Gençlerbirliği SK,Yusuf Hasan Temel,FVT,21
Gençlerbirliği SK,Prince Martor,FVT,21
Gençlerbirliği SK,Dilhan Demir,FVT,21
Gençlerbirliği SK,Ayaz Özcan,FVT,20
`.trim();

// ---------------- Helpers ----------------

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

/** OS/DEF gibi pozisyonları normalize et (schema: KL, DEF, OS, FVT) */
const normalizePosition = (raw) => {
  const p = String(raw || "").toUpperCase().trim();
  if (p.includes("KL") || p.includes("GK")) return "KL";
  // OS/DEF gibi ise DEF mi OS mi? Ben DEF öncelik verdim, istersen OS yaparız.
  if (p.includes("DEF")) return "DEF";
  if (p.includes("FVT") || p.includes("ST") || p.includes("FW")) return "FVT";
  if (p.includes("OS") || p.includes("AM") || p.includes("MC") || p.includes("DM") || p.includes("LW") || p.includes("RW"))
    return "OS";
  return "OS";
};

/** CSV takım adlarını DB takım adlarına map'le */
const teamNameMap = {
  "Galatasaray SK": "Galatasaray",
  "Fenerbahçe SK": "Fenerbahçe",
  "Beşiktaş JK": "Beşiktaş",
  "Trabzonspor AŞ": "Trabzonspor",
  "Göztepe AŞ": "Göztepe",
  "Samsunspor AŞ": "Samsunspor",
  "Gaziantep FK": "Gaziantep",
  "Çaykur Rizespor AŞ": "Çaykur Rizespor",
  "Kasımpaşa SK": "Kasımpaşa",
  "Fatih Karagümrük SK": "Karagümrük",
  "Başakşehir FK": "Başakşehir",
  "Gençlerbirliği SK": "Gençlerbirliği",
};

/** Tier sistemi: büyük takım daha güçlü */
const teamTier = (teamName) => {
  // A: şampiyonluk adayı
  const A = new Set(["Galatasaray", "Fenerbahçe", "Beşiktaş"]);
  // B: üst sıra / Avrupa kovalayan
  const B = new Set(["Trabzonspor", "Başakşehir"]);
  // C: orta-üst
  const C = new Set(["Konyaspor", "Antalyaspor", "Alanyaspor", "Kayserispor", "Karagümrük", "Kasımpaşa", "Eyüpspor"]);
  // D: orta-alt / yeni
  const D = new Set(["Samsunspor", "Göztepe", "Gaziantep", "Kocaelispor", "Çaykur Rizespor", "Gençlerbirliği"]);

  if (A.has(teamName)) return "A";
  if (B.has(teamName)) return "B";
  if (C.has(teamName)) return "C";
  if (D.has(teamName)) return "D";
  return "C";
};

const tierBase = (tier) => {
  if (tier === "A") return 78;
  if (tier === "B") return 76;
  if (tier === "C") return 73;
  if (tier === "D") return 71;
  return 73;
};

/** deterministik küçük varyans (her seed'de aynı çıksın) */
const hashToRange = (str, min, max) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  const span = max - min + 1;
  return min + (h % span);
};

/** yıldız oyuncu override (istersen listeyi büyütürüz) */
const overrides = new Map([
  // Galatasaray
  ["Victor Osimhen", 88],
  ["Mauro Icardi", 86],
  ["Leroy Aziz Sané", 86],
  ["İlkay Gündoğan", 86],
  ["Lucas Torreira", 84],
  ["Uğurcan Çakır", 84],
  ["Davinson Sánchez", 82],
  ["Abdülkerim Bardakcı", 80],

  // Fenerbahçe
  ["Ederson", 86],
  ["Milan Škriniar", 84],
  ["Fred", 82],
  ["Anderson Talisca", 83],
  ["Marco Asensio", 82],
  ["Edson Álvarez", 83],
  ["Çağlar Söyüncü", 81],
  ["Sebastian Szymański", 82],
  ["Youssef En-Nesyri", 82],
  ["Jhon Durán", 80],
  ["Kerem Aktürkoğlu", 81],

  // Beşiktaş
  ["Orkun Kökçü", 83],
  ["Wilfred Ndidi", 81],
  ["Rafa Silva", 82],
  ["Tammy Abraham", 82],

  // Trabzonspor / Başakşehir örnek
  ["André Onana", 84],
  ["Stefan Savić", 81],
  ["Eldor Shomurodov", 80],
]);

/** overall üretimi: tier + pozisyon + yaş + küçük deterministik varyans */
const calcOverall = ({ teamName, name, position, age }) => {
  // 1) Override varsa direkt
  if (overrides.has(name)) return overrides.get(name);

  const tier = teamTier(teamName);
  let base = tierBase(tier);

  // Pozisyon etkisi
  // Forvetler biraz daha “parlak” olsun, orta saha bir tık, defans/kaleci dengeli
  const pos = normalizePosition(position);
  if (pos === "FVT") base += 2;
  else if (pos === "OS") base += 1;
  else base += 0;

  // Yaş etkisi
  // 23-29 prime +1, 30-32 0, 33-34 -1, 35+ -2, 18-20 -1
  if (age >= 23 && age <= 29) base += 1;
  else if (age >= 33 && age <= 34) base -= 1;
  else if (age >= 35) base -= 2;
  else if (age <= 20) base -= 1;

  // Deterministik varyans (-2..+2)
  const jitter = hashToRange(`${teamName}|${name}|${pos}|${age}`, -2, 2);

  // Son clamp
  return clamp(base + jitter, 62, 90);
};

const parseCSV = (csv) => {
  const lines = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) return [];

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",").map((x) => x.trim());
    if (parts.length < 4) continue;

    const rawTeam = parts[0];
    const team = teamNameMap[rawTeam] || rawTeam; // map yoksa olduğu gibi
    const name = parts[1];
    const position = parts[2];
    const age = Number(parts[3]);

    if (!team || !name || !position || Number.isNaN(age)) continue;
    rows.push({ team, name, position, age });
  }
  return rows;
};

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB bağlantısı OK (seedPlayersAll)");

    // 1) CSV parse
    const rows = parseCSV(CSV);
    console.log(`✅ CSV satır sayısı: ${rows.length}`);

    // 2) Lig oyuncularını komple temizle (temiz kurulum)
    await Player.deleteMany({ league: LEAGUE });
    console.log(`🧹 ${LEAGUE} oyuncuları silindi.`);

    // 3) Takımları tek seferde çek
    const teams = await Team.find({ league: LEAGUE });
    const teamByName = new Map(teams.map((t) => [t.name, t]));

    // 4) Player docs hazırla
    const docs = [];
    const missingTeams = new Set();

    for (const r of rows) {
      const teamDoc = teamByName.get(r.team);
      if (!teamDoc) {
        missingTeams.add(r.team);
        continue;
      }

      const position = normalizePosition(r.position);
      const overall = calcOverall({
        teamName: teamDoc.name,
        name: r.name,
        position,
        age: r.age,
      });

      docs.push({
        name: r.name,
        position,
        age: r.age,
        overall,
        team: teamDoc._id,
        league: LEAGUE,
        // xp/form/fitness schema default’larıyla da olur, ama net koyalım:
        xp: 0,
        form: 100,
        fitness: 100,
      });
    }

    if (missingTeams.size > 0) {
      console.warn("⚠️ DB’de bulunamayan takımlar (önce seedTeams çalıştır):");
      console.warn([...missingTeams].join(", "));
    }

    if (!docs.length) {
      console.error("❌ Eklenecek oyuncu kalmadı. Takım isimleri eşleşmiyor olabilir.");
      process.exit(1);
    }

    // 5) Insert
    const result = await Player.insertMany(docs);
    console.log(`✅ Toplam ${result.length} oyuncu eklendi.`);

    // 6) Küçük özet: takım başına kaç oyuncu
    const counts = {};
    for (const d of docs) {
      const tName = teams.find((t) => String(t._id) === String(d.team))?.name || "UNKNOWN";
      counts[tName] = (counts[tName] || 0) + 1;
    }
    console.log("------ Takım başına oyuncu sayısı ------");
    console.table(counts);

    process.exit(0);
  } catch (err) {
    console.error("❌ seedPlayersAll hata:", err);
    process.exit(1);
  }
}

run();
