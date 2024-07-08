# Color-Palette
[React版本連結](https://github.com/johnny95731/Color-Palette)。
網頁配色調色盤工具。

## Header工具列
上方工具列依序為「Refresh(重新整理所有)」、「Sort(排序)」、「Insert Algo(插入卡片算法)」、「Mode(編輯色彩模式)」。

- ### <img src="./src/assets/icons/arrow-clockwise.svg" alt="refresh" /> Refresh
  刷新所有沒上鎖的卡片，快捷鍵: `空白建(space)`<br />

- ### <img src="./src/assets/icons/play.svg" alt="play" /> / <img src="./src/assets/icons/pause-fill.svg" alt="pause" /> Slides (投影片播放)
  定時刷新調色盤，由顏色的過渡時間(transition-duration)決定，最少為1000毫秒。<br />
  
- ### <img src="./src/assets/icons/sort-down.svg" alt="sort" /> Sort (排序)
  排序卡片。三種方法為「依照亮度(Gray, 快捷鍵: `g`)」、「隨機排序(Random, 快捷鍵: `r`)」、「反轉左右順序(Invert, 快捷鍵: `i`)」。
  
- ### <img src="./src/assets/icons/file-earmark-plus.svg" alt="blend" /> Blend (混色方法)
  混色方法，提供「平均值（Mean，預設）」、「更亮(brighter)」、「更暗(deeper)」、「soft light」、「隨機(Random)」。平均值以Space選取值計算。「brighter」與「deeper」先以RGB平均值計算，再透過HSL空間調整亮度與彩度。「[soft light](https://en.wikipedia.org/wiki/Blend_modes)」使用illusions.hu的公式(此方法非左右對稱)。
  
- ### <img src="./src/assets/icons/sliders.svg" alt="edit" /> Space (色彩空間)
  展示模式及編輯模式中，使用的色彩空間。提供「RGB」、「NAME（named-color, 預設）」、「HSB」、「HSL」、「CMY」、「CMYK」、「XYZ」、「LAB」。
  
- ### <img src="./src/assets/icons/bookmarks.svg" alt="bookmarks" /> Bookmarks (書籤頁)
  開啟書籤欄，包括顏色書籤及調色盤書籤。
  
- ### <img src="./src/assets/icons/gear.svg" alt="bookmarks" /> Settings (設定)
  開啟/關閉卡片邊框、調整過度動畫時間、調整對比。

## 卡片Card
鼠標移至卡片上會顯示工具，依序為「刪除」、「鎖定」、「加入書籤」、「拉動卡片」、「重新整理」、「編輯」。鼠標在卡片兩側會顯示箭頭，點選箭頭可在兩卡片間插入卡片。卡片的數量為2~8，預設5。

- ### <img src="./src/assets/icons/x-lg.svg" alt="del" /> 刪除
  刪除卡片。卡片數量為2時隱藏。

- ### <img src="./src/assets/icons/unlock-fill.svg" alt="unlock" /> / <img src="./src/assets/icons/lock-fill.svg" alt="lock" /> 切換鎖定狀態
  卡片鎖定可避免隨機刷新顏色，仍可使用編輯模式修改。

- ### <img src="./src/assets/icons/star.svg" alt="isUnfavorite" /> / <img src="./src/assets/icons/star-fill.svg" alt="isFavorite" /> 切換書籤狀態
  將顏色加入/移出書籤

- ### <img src="./src/assets/icons/arrows.svg" alt="fav" /> 拖曳卡片
  拖曳更換順序

- ### <img src="./src/assets/icons/arrow-clockwise.svg" alt="refresh" /> 刷新
  隨機刷新顏色。

- ### <img src="./src/assets/icons/sliders.svg" alt="edit" /> 開啟編輯模式
  進入編輯模式，可輸入RGB Hex碼或是操控滑桿調整數值。<br />

- ### 展示模式 / 編輯模式
  在展示模式中，顯示RGB Hex碼以及指定色彩空間數值。點選文字即可複製字串。<br />
  可在上方「Space」選單改變色彩空間，預設為RGB。<br />
  在編輯模式中，Hex碼換更換為可編輯狀態，色彩空間轉為滑桿。<br />
  編輯Hex碼後，若不是有效的Hex顏色，則不會自動更新(按下enter或點擊旁邊)。<br />
  滑桿會即時更新數值。

## Bookmarks書籤頁
頁面下方按鈕可將調色盤加入書籤頁。
上方可選取頁面colors與palettes，每個書籤右方有移除按鈕。
palettes頁面中，書籤左方按鈕可替換成此調色盤。

## Settings設定
開啟/關閉卡片邊框，調整邊框寬度及顏色(黑、白、灰)。
調整卡片位置、顏色過度動畫時間。
由RGB空間進行線性轉換或gamma轉換以調整亮度對比。

## 版權宣告
Favicon: color-wheel.png來自flaticon之[Color creator](https://www.flaticon.com/authors/color-creator)<br />
其餘圖案來自[Bootstrap Icons](https://icons.getbootstrap.com/)
