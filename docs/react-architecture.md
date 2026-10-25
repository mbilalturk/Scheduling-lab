# React + TypeScript mimarisi

## Beş farklı veri rolü

1. **Process:** Doğrulanmış algoritma girdisi. `id`, `arrival`, `burst` içerir. Formdan veya React'ten habersizdir.
2. **WorkingProcess:** Algoritmanın bir çalıştırmaya özel iç durumu. `order` ve değişebilir `remaining` ekler. Kullanıcı girdisini değiştirmek yerine kopya üzerinde ilerler.
3. **DraftProcess:** Kullanıcının düzenlediği form. Sayı alanları bile metindir; kullanıcı bir alanı geçici olarak boş bırakabilir. `key`, kullanıcı tarafından değiştirilen `id` alanından ayrıdır.
4. **SimulationResult:** Tamamlanmış çalışmanın çizelgesi, metrikleri ve ortalamaları. Tip sözleşmesi readonly'dir.
5. **TraceEntry:** Ekran için türetilen görünüm modeli. Çizelge aralığına süre ve o aralıktan sonra kalan CPU işi ekler. Yeni bir zamanlama kararı vermez.

## Bağımlılık yönü

React bileşenleri uygulama durumunu ve çekirdek tiplerini kullanır. Uygulama reducer'ı `runSimulation()` fonksiyonunu çağırır. Çekirdeğin içinde React, DOM, HTTP veya dosya sistemi yoktur. Yarın farklı bir arayüz yapılırsa algoritmalar ve testleri korunabilir.

`simulate()` önceki üç parametreli sözleşmeyi korur. Böylece eski 63 test aynen kullanılabilir. Yeni `runSimulation(processes, options)` girişinde seçenek tipi iki olasılıktır: RR için quantum zorunlu; diğer algoritmalarda gerekmez. TypeScript bunu derleme sırasında kontrol eder. Çalışma zamanı doğrulaması yine gereklidir; tipler kullanıcının formdan negatif sayı girmesini engellemez.

## Sonuç durumu neden tek bir union?

`Outcome`, yalnızca `draft`, `error` veya `success` olabilir. Ayrı `isLoading`, `hasResult`, `errorMessage` gibi birbiriyle çelişebilen bayraklar tutmuyoruz. Düzenleme, algoritma değiştirme veya yükleme, durumu tek reducer geçişinde `draft` yapar. Ancak son başarılı çalıştırmayı silmez.

`RunSnapshot`, sonucu; kullanılan algoritma/quantum, iş yükü adı ve çalıştırma revizyonuyla birlikte saklar. `draft` ve `error` durumları isteğe bağlı `previousRun` taşır. `getLastRun()` gösterilecek son başarılı çalıştırmayı seçer; görünüm onun eski bir çalıştırma olduğunu açıkça bildirir. Başarılı bir yeniden çalıştırma snapshot'ı tek seferde değiştirir. Böylece ekrandaki sonuçları yanlışlıkla yeni formun algoritmasıyla etiketlemeyiz.

`ConfigurationForm` bütün girdileri tek formda toplar. `SimulationResults`, formun altında tam genişlikte son çalıştırmayı gösterir. Ağır çizelge içeriği memo ile korunur; yalnızca girdiyi düzenlemek aynı eski çizelgenin yeniden hesaplanmasına veya seçili aralığın sıfırlanmasına yol açmaz.

Reducer, eski state ve action alıp yeni state döndüren saf fonksiyondur. Form alanlarını parse edip algoritmayı çağırması da deterministiktir; dış I/O yapmaz. Node testleri bunu React açmadan kontrol eder. React `useReducer` yalnızca bu geçişleri ekrana bağlar.

## OOP ilkeleri, amaçlı soyutlama

Tek sorumluluk: algoritma planlar, metrik fonksiyonu ölçer, React gösterir. Kapsülleme: kuyruk ve kalan süreler her çalıştırmaya aittir. Sözleşme: TypeScript arayüzleri veri sınırlarını tanımlar. Bileşim: FCFS ve SJF ortak kesintisiz döngüye farklı karşılaştırma fonksiyonları verir.

Kalıcı simülasyon nesnesi veya kalıtım hiyerarşisi eklenmedi. Tek çağrıda sonuç üreten dört algoritma için sınıf yaşam döngüsünün somut faydası yok. Yerel çalışma kayıtlarının değişmesi saflığı bozmaz; çağıranın verisini veya paylaşılan dış durumu değiştirmek bozar. `readonly` derleme zamanı güvencesidir, runtime `Object.freeze` değildir.

## Okuma sırası

`types.ts` → `runSimulation.ts` → `simulate.ts` → `algorithms.ts` → `metrics.ts` → `simulationState.ts` → `App.tsx` → ilgili bileşen.

Önce Workload A FCFS testine bak, sonra aynı girdiyi bu akışta takip et. Testler ve kullanıcı arayüzü aynı çekirdeğe gider; test beklentileri çekirdeğin içinden üretilmez.
