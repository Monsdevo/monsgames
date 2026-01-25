// Zincirleri ayrı ayrı değişken olarak tutuyoruz
const tropicalChain = `
  <div class="animal-container">
    <div class="btn" id="animal"> <img src="tiger.png" alt="tiger" style="height: 150px; width: 150px; object-fit: contain;"></div>
    <div class="animal-description"><h1>Kaplan</h1><span>
      🐅 Kaplan azalırsa: <br> Maymunlar artar → Ağaçlar zarar görür → Ormanlar azalır
    </span></div>
  </div>
  <div class="animal-container">
    <div class="btn" id="animal"> <img src="monkey.png" alt="monkey" style="height: 150px; width: 150px; object-fit: contain;"></div>
    <div class="animal-description"><h1>Maymun</h1><span>
      🐒 Maymun azalırsa: <br> Ağaçlar korunur → Yapraklar çoğalır → Orman dengesi korunur
    </span></div>
  </div>
  <div class="animal-container">
    <div class="btn" id="animal"> <img src="tree.png" alt="tree" style="height: 150px; width: 150px; object-fit: contain;"></div>
    <div class="animal-description"><h1>Ağaç</h1><span>
      🌳 Ağaçlar azalırsa: <br> Hayvanlar barınaksız kalır → Türler azalır
    </span></div>
  </div>
  <div class="animal-container">
    <div class="btn" id="animal"> <img src="leaf.png" alt="leaf" style="height: 150px; width: 150px; object-fit: contain; transform: rotateZ(90deg);"></div>
    <div class="animal-description"><h1>Yaprak</h1><span>
      🍃 Yapraklar azalırsa: <br> Fotosentez azalır → Oksijen düşer → Yaşam tehlikeye girer
    </span></div>
  </div>
`;

const seaChain = `
  <div class="animal-container">
    <div class="btn" id="animal"> <img src="shark.png" alt="shark" style="height: 150px; width: auto;"></div>
    <div class="animal-description"><h1>Köpekbalığı</h1><span>
      🦈 Köpekbalığı azalırsa: <br>
      - Orta boy balıklar artar<br>
      - Küçük balıkları aşırı avlarlar<br>
      - Ekosistemde dengesizlik oluşur
    </span></div>
  </div>
  <div class="animal-container">
    <div class="btn" id="animal"> <img src="tuna.png" alt="fish" style="height: 150px; width: auto;"></div>
    <div class="animal-description"><h1>Orta Boy Balık</h1><span>
      🐟 Orta boy balık azalırsa: <br>
      - Küçük balıklar artar<br>
      - Zooplanktonları fazla yerler<br>
      - Plankton dengesi bozulur
    </span></div>
  </div>
  <div class="animal-container">
    <div class="btn" id="animal"> <img src="lilfish.png" alt="fish" style="height: 150px; width: auto;"></div>
    <div class="animal-description"><h1>Küçük Balık</h1><span>
      🐠 Küçük balıklar azalırsa: <br>
      - Zooplanktonlar çoğalır<br>
      - Fitoplanktonları aşırı tüketirler<br>
      - Oksijen seviyesi düşebilir
    </span></div>
  </div>
  <div class="animal-container">
    <div class="btn" id="animal"> <img src="zooplankton.png" alt="zooplankton" style="height: 150px; width: 150px; object-fit: contain;"></div>
    <div class="animal-description"><h1>Zooplankton</h1><span>
      🦐 Zooplankton azalırsa: <br>
      - Fitoplanktonlar artar<br>
      - Alg patlaması yaşanabilir<br>
      - Suda oksijen tükenebilir
    </span></div>
  </div>
  <div class="animal-container">
    <div class="btn" id="animal"> <img src="pythoplankton.png" alt="phytoplankton" style="height: 150px; width: 150px; object-fit: contain;"></div>
    <div class="animal-description"><h1>Fitoplankton</h1><span>
      🌿 Fitoplankton azalırsa: <br>
      - Oksijen üretimi düşer<br>
      - Su canlıları zorlanır<br>
      - Tüm denge alt üst olur
    </span></div>
  </div>
`;



const stepBiom = `
  <div class="animal-container">
            <div class="btn" id="animal"> <img src="hawk.png" alt="hawk" style="height: 150px; width: auto;"></div>
            <div class="animal-description"><h1>Şahin</h1><span>
                🦅 Şahin eksilirse: <br>Yılanlar avcı kaybettiği için artar <br>Yılanlar artınca kurbağa azalır <br>Kurbağa azalınca çekirge artar <br>Çekirge artarsa bitkiler azalır
            </span></div>
        </div>    
        <div class="animal-container">
            <div class="btn" id="animal"> <img src="snake.png" alt="snake" style="height: 150px; width: auto;"></div>
            <div class="animal-description"><h1>Yılan</h1><span style="font-size: 16px;">
                🐍 Yılan eksilirse: <br>Kurbağalar artar <br>Kurbağa artınca → çekirgeler azalır <br>Çekirge azalınca bitki artabilir <br>Şahinler aç kalır → şahin azalır</span></div>
        </div>  
        <div class="animal-container">
            <div class="btn" id="animal"> <img src="frog.png" alt="frog" style="height: 150px; width: auto;"></div>
            <div class="animal-description"><h1>Kurbağa</h1><span style="font-size: 15px;">
                🐸 Kurbağa eksilirse:<br> Yılanlar yiyecek bulamaz → azalır <br>Şahinler dolaylı olarak aç kalır → azalır <br>Çekirgeler avlanmadığı için çoğalır → artar<br> Çekirgeler çoğalınca → bitkiler azalır
            </span></div>
        </div>  
        <div class="animal-container">
            <div class="btn" id="animal"> <img src="grasshopper.png" alt="grasshopper" style="height: 150px; width: 150px; object-fit: contain;"></div>
            <div class="animal-description"><h1>Çekirge</h1><span style="font-size: 15px;">
                🦗 Çekirge eksilirse:<br> Kurbağalar ana besinini kaybeder → azalır<br> Yılanlar kurbağa bulamaz → azalır <br>Şahinler de yine aç kalır → azalır <br>Bitkilere baskı azalır → çoğalabilir
            </span></div>
        </div>  
        <div class="animal-container">
            <div class="btn" id="animal"> <img src="wheat.png" alt="wheat" style="height: 150px; width: 150px; object-fit: contain;"></div>
            <div class="animal-description"><h1>Bitki</h1><span style="font-size: 14px;">🌿 Bitki eksilirse:<br>
                Çekirgeler aç kalır → sayıları azalır<br> Kurbağalar yemek bulamaz → ve azalır<br> Yılanlar kurbağa bulamaz → azalır<br> Şahinler yılan avlayamaz → azalır
            </span></div>
        </div> 
`;

// Zinciri değiştiren fonksiyon
function changeChain(chainName) {
  const output = document.getElementById("chainoutput");

  if (chainName === "seaChain") {
    document.body.style.backgroundImage = "url('underwater.jpeg')" ;
    output.innerHTML = seaChain;
  } else if (chainName === "tropicalChain") {
    document.body.style.backgroundImage = "url('tropic.jpg')";
    output.innerHTML = tropicalChain;
  } else {
    document.body.style.backgroundImage = "url('nevada.jpg')";
    output.innerHTML = stepBiom;
  }
}
