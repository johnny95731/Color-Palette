# Color-Palette
[React版本連結](https://github.com/johnny95731/Color-Palette-React-)。
產生調色盤用於設計，為你的專案擬定色彩計畫。<br>
提供8種色彩空間（含css named-color）、書籤紀錄、幻燈片切換等功能。其他包括成自動排序、新增卡片時的多種混色方式、調整亮度對比，以及卡片增加border以降低對比引起的視錯覺、調整顏色的過渡時間避免閃爍或欣賞漸變幻燈片。

## Header工具列
上方工具列依序為刷新、幻燈片播放/暫停、排序、混色方法、色彩空間、調和調色盤、書籤頁以及設定。

- ### <img style="background:white;padding:1px" src="./src/assets/icons/arrow-clockwise.svg" alt="refresh"/> 刷新 Refresh
  刷新所有沒上鎖的卡片，快捷鍵: `r`。

- ### <img style="background:white;padding:1px" src="./src/assets/icons/play.svg" alt="play"/> / <img style="background:white;padding:1px" src="./src/assets/icons/pause-fill.svg" alt="pause"/> 幻燈片播放/暫停 Slides
  定時刷新調色盤，由顏色的過渡時間(transition-duration)決定，最少為1000毫秒。

- ### <img style="background:white;padding:1px" src="./src/assets/icons/sort-down.svg" alt="sorting"/> 排序 Card Sorting
  排序卡片。提供「依照亮度(Gray, 快捷鍵: `g`)」、「隨機排序(Random, 快捷鍵: `n`)」、「左右反轉(Inversion, 快捷鍵: `j`)」、「CIE76」、「CIE94」、「CIEDE2000」。

- ### <img style="background:white;padding:1px" src="./src/assets/icons/file-earmark-plus.svg" alt="mixing"/> 混色方法 Color Mixing
  新增卡片時的混色方法，提供平均值（Mean，預設）、更亮(brighter)、更暗(deeper)、soft light、Additive(RGB加法計算)、隨機(Random)。<br/>
  平均值以指定的色彩空間計算。brighter與deeper先以RGB平均值計算，再透過HSL空間調整亮度與彩度。「[soft light](https://en.wikipedia.org/wiki/Blend_modes)」使用illusions.hu的公式(此方法非左右對稱)。

- ### <img style="background:white;padding:1px" src="./src/assets/icons/sliders.svg" alt="space"/> 色彩空間 Color Space
  展示模式及編輯模式中，使用的色彩空間。提供sRGB、NAME（CSS named-color, 預設）、HSL、HSB、HWB、CMYK、CIEXYZ、CIELAB、CIELUV、CIELCH(ab)、CIELCH(uv)、YUV。

  sRGB <-> CIEXYZ為D65光源的矩陣。

- ### <img style="background:white;padding:1px" src="./src/assets/icons/circle-half.svg" alt="contrast"/> 對比 Contrast
  1. 調整調色盤對比，可使用自動調整方法，或是透過線性轉換及gamma校正手動調整的。
  2. 計算兩個顏色的[對比值](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html#dfn-contrast-ratio)，並用以檢驗使否符合WCAG AA或AAA標準。

- ### <img style="background:white;padding:1px" src="./src/assets/icons/upload.svg" alt="bookmarks"/> 輸入調色盤 Harmony Generator
  可同時顯示、修改所有HEX並更換順序，以及透過貼上覆蓋多個值，格式與書籤頁相同，以`-`分隔HEX字串。

- ### <img style="background:white;padding:1px" src="./src/assets/icons/palette.svg" alt="bookmarks"/> 調和調色盤 Harmony Generator
  透過色彩調和方法產生調色盤，方法包括（括號內為主色以外的hsb色相角度）：
    1. analogous(相似色±30°)
    2. shades(亮度等差下降)
    3. tints(彩度等差下降)
    4. tones(亮度彩度等差下降)
    5. triadic(正三角形±120°)
    6. square(正四邊形90°,180°,270°)
    7. complement(補色180°)
    8. split complement (補色分割±150°)
    9. tetradic1(30°,180°,210°)
    10. tetradic2(60°,180°,240°)
    11. tetradic3(30°,180°,150°)

- ### <img style="background:white;padding:1px" src="./src/assets/icons/bookmarks.svg" alt="bookmarks"/> 書籤頁 Bookmarks
  書籤頁，包括新增調色盤書籤、查看顏色及調色盤兩種書籤。

  有color與palette兩頁面，下方按鈕可將調色盤加入書籤頁。<br/>
  palettes頁面中，書籤左方按鈕<img style="background:white;padding:1px" src="./src/assets/icons/caret-left-fill.svg" alt="edit"/>可替換成此調色盤。

- ### <img style="background:white;padding:1px" src="./src/assets/icons/gear.svg" alt="bookmarks"/> 設定 Settings
  卡片邊框設定、調整顏色及位置的過度動畫時間、顏色字串為modern或legacy格式。

- ### <img style="background:white;padding:1px" src="./src/assets/icons/github.svg" alt="github"/> 設定 Settings
  專案[github連結](https://github.com/johnny95731/Color-Palette)



## 卡片 Card
卡片數量預設5，可增減為2~8。鼠標移至卡片上會顯示工具，依序為<img style="background:white;padding:1px" src="./src/assets/icons/x-lg.svg" alt="delete"/>刪除、<img style="background:white;padding:1px" src="./src/assets/icons/unlock-fill.svg" alt="unlock"/> / <img style="background:white;padding:1px" src="./src/assets/icons/lock-fill.svg" alt="lock"/>鎖定、<img style="background:white;padding:1px" src="./src/assets/icons/star.svg" alt="isUnfavorite"/> / <img style="background:white;padding:1px" src="./src/assets/icons/star-fill.svg" alt="isFavorite"/>加入書籤、<img style="background:white;padding:1px" style="background:white;padding:1px" src="./src/assets/icons/arrows.svg" alt="fav"/>拖曳卡片、<img style="background:white;padding:1px" src="./src/assets/icons/arrow-clockwise.svg" alt="refresh"/></->刷新、<img style="background:white;padding:1px" src="./src/assets/icons/sliders.svg" alt="edit"/>編輯。鼠標在卡片邊緣會顯示<img style="background:white;padding:1px" src="./src/assets/icons/arrows-expand-vertical.svg" alt="expand"/>圖案，點選圖案即可插入卡片。

- ### <img style="background:white;padding:1px" src="./src/assets/icons/x-lg.svg" alt="delete"/> 刪除
  刪除卡片。卡片最小數量為2。

- ### <img style="background:white;padding:1px" src="./src/assets/icons/unlock-fill.svg" alt="unlock"/> / <img style="background:white;padding:1px" src="./src/assets/icons/lock-fill.svg" alt="lock"/> 切換鎖定狀態
  卡片鎖定可避免隨機刷新顏色，仍可使用編輯模式修改。

- ### <img style="background:white;padding:1px" src="./src/assets/icons/star.svg" alt="isUnfavorite"/> / <img style="background:white;padding:1px" src="./src/assets/icons/star-fill.svg" alt="isFavorite"/> 切換書籤狀態
  加入/移出書籤

- ### <img style="background:white;padding:1px" src="./src/assets/icons/arrows.svg" alt="fav"/> 拖曳卡片
  拖曳以更換順序

- ### <img style="background:white;padding:1px" src="./src/assets/icons/arrow-clockwise.svg" alt="refresh"/> 刷新
  隨機刷新顏色。

- ### <img style="background:white;padding:1px" src="./src/assets/icons/sliders.svg" alt="edit"/> 開啟編輯模式
  進入編輯模式，可輸入Hex碼（RGB）或是操控滑桿調整數值（指定的色彩空間）。<br/>
  編輯Hex碼後，若不是有效的Hex顏色，則不會自動更新(按下enter或點擊旁邊)。
  滑桿則會即時更新數值。

- ### 字串
  Hex碼以及指定色彩空間數值。點選文字即可複製字串。<br/>

## 設定 Settings
卡片邊框、過渡動畫設定，以及對比調整。
- ### Card卡片
  開啟/關閉卡片邊框，並且可設定寬度為1px~10px及顏色(黑、白、灰)。<br/>
  拖曳卡片位置以及更改顏色的過度動畫時間。<br/>

## Icons
[Bootstrap Icons](https://icons.getbootstrap.com/)
