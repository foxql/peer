# FoxQL

Foxql, web2 teknolojileri ile merkezi olmayan uygulamalar geliştirmenizi sağlar.

- Doğası gereği foxql ile geliştirdiğiniz uygulamalar oldukça kaotik bir çalışma şekline sahip olacaklar.
- Bir verinin varlığı, veriyi sahiplenen düğümün ulaşılabilir olmasına bağlıdır. Bu ağda sorduğunuz sorunun cevabının t anında varlığını sorgulayabildiğiniz anlamına gelir. 
- Verilerin varlığının kesin olarak kanıtlanabilmesi için düğümlerinize herhangi bir web3 blok zincirinde çıkartacağınız tokenları ödül olarak dağıtabilirsiniz.
- FoxQL sinyalleşme aşamasında görece olarak merkezidir. Bu önemli değil çünkü sinyalleşme oldukça ucuz bir çözüm. Siz istediğiniz sürece ağda iletişim her zaman devam edecektir.
- Yaptığınız her eylem rastgele bir hash sorusu üretecektir. Cevabı dinlediğiniz süre ve seçilebilir nonce aralığı dinlediğiniz etkinliğin zorluğunu belirleyecektir.
- FoxQL gerekmedikçe diğer düğümler ile etkileşime girmez, etkileşime girdiği düğümler ile işi bittiğinde bağlantıları öldürür ve yenilerini beklemeye devam eder. Bu webRTC tarafında bazı performans ve sınırlandırmaların önemi olmadığı anlamına gelir.
- Son kullanıcı dilediği taktirde düğümü ile alakalı olan tüm bilgileri farklı bir platforma geçirebilir. Bu geliştiricilerin son kullanıcıyı rahatsız edebilecek kararlar almasını engeller.
- FoxQL hiç bir etkinliğin kaydını tutmaz, düğümler arasında gerçekleşen veri alışverişini takip etmez. Sadece soruların diğer düğümlere iletilmesini ve yeni bir bağlantı yarışının başlamasını sağlar

## Kurulum
[npm](https://www.npmjs.com)

```bash
npm i @foxql/foxql-peer
```

## Kurulum

```javascript
import foxql from '@foxql/foxql-peer';

const node = new foxql({
    maxNodeCount: 30, // Aktif bağlantı limiti
    maxCandidateCallTime: 2000, // Düğüm adayları için sorulan soru kaç milisaniye dinlenmeli?
    bridgeServer: {
        host: '{YOUR_SELECTED_BRIDGE_URI}' // Hangi köprü sunucusunu kullanmak istiyorsun?
    },
    nodeAlias: 'demo-app'
})


```

### Düğüm meta bilgileri
```javascript
node.setMetaData({
    name: 'test-node',
    description: 'test-desc'
})
```

### Etkinlik tanımı
Düğüm etkinlikleri P2P bağlantının sağlanabilmesi ve veri alışverişi için kullanılır. Her etkinlik iki farklı aşamadan meydana gelir. Simulate durumunun true gelmesi etkinliğin webSocket aracılığı ile çağırıldığını belirtir.

Simulate durumunun pozitif olduğu durumlarda yeni bir webRTC bağlantısına aday olup olmayacağınıza karar vermelisiniz.

```javascript
node.on('hello-world', async ({sender, message}, simulate = false)=>{
	 if(simulate) { 
        console.log('Simulate state')
        // work on proof case
        return true  // accept webRTC connection.
    }
    // webRTC 
    this.reply(sender, {
        hi: this.nodeId
    })
})
```

### Düğüm keşfi
```javascript
async function broadcast(){
	 const answer = await node.ask({
        transportPackage: {
            p2pChannelName: 'hello-world',
            message: 'Hello world'
        }
    })
	return answer
}
```
### Yapışkan düğümler
stickyNode seçeneği bağlantıların karşılıklı sabitlenmesini sağlar. FoxQL varsayılan olarak her keşiften sonra bağlantıları öldürür.
```javascript
node.ask({
	transportPackage: {
		p2pChannelName: 'hello-world',
		message: 'Hello world'
	},
	stickyNode: true
})
```

### Yerel Keşif
Ağ üzerinde sorduğunuz her keşif sorusu varsayılan olarak bağlantılı olduğunuz tüm düğümlere tekrar sorulur. Bazı spesifik durumlar için soruyu sadece yeni adaylara yönlendirebilirsiniz. Bu düğüm trafiğinizi azaltmanızı sağlar.
```javascript
node.ask({
	transportPackage: {
		p2pChannelName: 'hello-world',
		message: 'Hello world'
	},
	localWork: true
})
```

### Düğümü Başlatın
```javascript
node.start()
```

## Katkıda bulun
PullRequest açarak eklenmesini istediğiniz yeni özellikleri tartışabiliriz. Fark edeceğiniz üzere doküman Türkçe hazırlandı, ilk iş olarak bunu çevirmeye başlayabilirsiniz.

## License
[MIT](https://github.com/foxql/peer/blob/main/LICENSE)