# Color-Palette
[React版本連結](https://github.com/johnny95731/Color-Palette-React-)。
產生調色盤用於設計，為你的專案擬定色彩計畫。<br>
提供8種色彩空間（含css named-color）、書籤紀錄、幻燈片切換等功能。其他包括成自動排序、新增卡片時的多種混色方式、調整亮度對比，以及卡片增加border以降低對比引起的視錯覺、調整顏色的過渡時間避免閃爍或欣賞漸變幻燈片。

## Header工具列
上方工具列依序為「Refresh(重新整理所有)」、「Slides（幻燈片）」、「Sorting(排序)」、「Mixing(混色方法)」、「Space(色彩空間)」。

- ### <span style="background: white"><img src="./src/assets/icons/arrow-clockwise.svg" alt="refresh" /></span> Refresh
  刷新所有沒上鎖的卡片，快捷鍵: `r`。

- ### <span style="background: white"><img src="./src/assets/icons/play.svg" alt="play" /></span> / <span style="background: white"><img src="./src/assets/icons/pause-fill.svg" alt="pause" /></span> Slides (幻燈片播放)
  定時刷新調色盤，由顏色的過渡時間(transition-duration)決定，最少為1000毫秒。

- ### <span style="background: white"><img src="./src/assets/icons/sort-down.svg" alt="sort" /></span> Sort (排序)
  排序卡片。提供「依照亮度(Gray, 快捷鍵: `g`)」、「隨機排序(Random, 快捷鍵: `n`)」、「左右反轉(Inversion, 快捷鍵: `j`)」。

- ### <span style="background: white"><img src="./src/assets/icons/file-earmark-plus.svg" alt="mix" /></span> Mixing (混色方法)
  新增卡片時的混色方法，提供「平均值（Mean，預設）」、「更亮(brighter)」、「更暗(deeper)」、「soft light」、「隨機(Random)」。平均值以指定的色彩空間計算。「brighter」與「deeper」先以RGB平均值計算，再透過HSL空間調整亮度與彩度。「[soft light](https://en.wikipedia.org/wiki/Blend_modes)」使用illusions.hu的公式(此方法非左右對稱)。

- ### <span style="background: white"><img src="./src/assets/icons/sliders.svg" alt="edit" /></span> Space (色彩空間)
  展示模式及編輯模式中，使用的色彩空間。提供「RGB」、「NAME（named-color, 預設）」、「HSB」、「HSL」、「CMY」、「CMYK」、「XYZ」、「LAB」。

- ### <span style="background: white"><img src="./src/assets/icons/bookmarks.svg" alt="bookmarks" /></span> Bookmarks (書籤頁)
  書籤頁，包括新增調色盤書籤、查看顏色及調色盤兩種書籤。

- ### <span style="background: white"><img src="./src/assets/icons/gear.svg" alt="bookmarks" /></span> Settings (設定)
  卡片邊框設定、調整顏色及位置過度動畫時間、調整對比。

## 卡片Card
鼠標移至卡片上會顯示工具，依序為「刪除」、「鎖定」、「加入書籤」、「拖曳卡片」、「重新整理」、「編輯」。鼠標在卡片兩側會顯示箭頭，點選箭頭可在兩卡片間插入卡片。卡片的數量為2~8，預設5。

- ### <span style="background: white"><img src="./src/assets/icons/x-lg.svg" alt="del" /></span> 刪除
  刪除卡片。卡片數量為2時隱藏。

- ### <span style="background: white"><img src="./src/assets/icons/unlock-fill.svg" alt="unlock" /></span> / <span style="background: white"><img src="./src/assets/icons/lock-fill.svg" alt="lock" /></span> 切換鎖定狀態
  卡片鎖定可避免隨機刷新顏色，仍可使用編輯模式修改。

- ### <span style="background: white"><img src="./src/assets/icons/star.svg" alt="isUnfavorite" /></span> / <span style="background: white"><img src="./src/assets/icons/star-fill.svg" alt="isFavorite" /></span> 切換書籤狀態
  將顏色加入/移出書籤

- ### <span style="background: white"><img src="./src/assets/icons/arrows.svg" alt="fav" /></span> 拖曳卡片
  拖曳更換順序

- ### <span style="background: white"><img src="./src/assets/icons/arrow-clockwise.svg" alt="refresh" /></span> 刷新
  隨機刷新顏色。

- ### <span style="background: white"><img src="./src/assets/icons/sliders.svg" alt="edit" /></span> 開啟編輯模式
  進入編輯模式，可輸入Hex碼（RGB）或是操控滑桿調整數值（指定的色彩空間）。<br />

- #### 展示模式 / 編輯模式
  在展示模式中，顯示Hex碼以及指定色彩空間數值。點選文字即可複製字串。<br />
  可在上方「<span style="background: white"><img src="./src/assets/icons/sliders.svg" alt="edit" /></span>Space」選單改變色彩空間。<br />
  在編輯模式中，編輯Hex碼後，若不是有效的Hex顏色，則不會自動更新(按下enter或點擊旁邊)。
  滑桿則會即時更新數值。

## Bookmarks書籤頁
頁面下方按鈕可將調色盤加入書籤頁。
上方可選取頁面colors與palettes切換查看的書籤類型，每個書籤右方有移除按鈕。
palettes頁面中，書籤左方按鈕可替換成此調色盤。

## Settings設定
卡片邊框、過渡動畫設定，以及對比調整。
- ### Card卡片
  開啟/關閉卡片邊框，並且可設定寬度為1px~10px及顏色(黑、白、灰)。<br />
  拖曳卡片位置以及更改顏色的過度動畫時間。<br />
- ### Contrast對比
  由RGB空間進行手動線性轉換或gamma轉換以調整亮度對比，或是在YUV空間自動調整。

## 版權宣告
Favicon: color-wheel.png來自flaticon之[Color creator](https://www.flaticon.com/authors/color-creator)<br />
其餘圖案來自[Bootstrap Icons](https://icons.getbootstrap.com/)
