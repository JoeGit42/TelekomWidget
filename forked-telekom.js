// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: signal;
// creator: https://github.com/Sillium | changed by https://github.com/LupusArgentum | change again by me, https://github.com/JoeGit42
const apiUrl = "https://pass.telekom.de/api/service/generic/v1/status"
const logoIsWanted =  (args.widgetParameter == "logo")  // value "logo" has to be added to widget konfiguration, to get Telekom-Logo in the upper right (longpress on widget to enable configuration)
const colorTimeToSignalEndOfMonth = false // for those who are requried to to monthly order of data valume: if only 3 days left, time becomes red
const showIndicationIfAPIOffline = false // if you want to be informed, if API is not available (e.g. if you are connected via WiFi). As data is cached, it's not a serious problem if API is not reachable. If cached data is older than 1 day, you will get indication in last row anyway.
const showAvailableVolume = true // some like to see the available data volume, some like to see the already used data volume.
const showAntennaLogo = true // nice looking antenna logo in the upper left corner

let widget = await createWidget()
if (!config.runsInWidget) await widget.presentSmall()
Script.setWidget(widget)
Script.complete()

async function createWidget(items) {
  let fm = FileManager.local()
  let dir = fm.documentsDirectory()
  let path = fm.joinPath(dir, "scriptable-telekom.json")
  let data = 0, api_online = false

  const list = new ListWidget()
  list.addSpacer()
  // no border on the right
  list.setPadding(10,10,10,0)
  // Open Telekom-page on klick
  list.url = "https://pass.telekom.de"
    
  try {
    let r = new Request(apiUrl)
  // API only answers for mobile Safari
    r.headers = {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1"
    }
    
    try {
      // Fetch data from pass.telekom.de
      data = await r.loadJSON()
      // add current time-stamp to JSON
      //const reqTime = new Date();
      data.dateStr = new Date().toJSON();
      // Write JSON to iCloud file
      fm.writeString(path, JSON.stringify(data, null, 2))
      api_online = true
    } catch (err) {
      // Read data from iCloud file
      data = JSON.parse(fm.readString(path), null)
      if (!data || !data.usedPercentage) {
        const errorList = new ListWidget()
        errorList.addText("Please disable WiFi for initial execution.")
        return errorList
      }
    }
    
    let line1
    let stack = list.addStack()
    let mobileIcon
    let mobileIconElement
    
     if (showAntennaLogo) {
       mobileIcon = SFSymbol.named('antenna.radiowaves.left.and.right');
       mobileIconElement = stack.addImage(mobileIcon.image)
       mobileIconElement.imageSize = new Size(16, 16)
       mobileIconElement.tintColor =  Color.dynamic(Color.black(), Color.white())
    }
    
    // if an additional datapass is booked, display "Pass:" + passname, else display "Datenvolumen:"
    if (data.passName == "Ihr Datenvolumen" || data.passName == "Ihr Telekom Datentarif" || data.passName.length <= 1) { // you may need to change this! (check your pass name)
      line1 = stack.addText(" DATENVOLUMEN")
    } else line1 = stack.addText("Pass: " + data.passName)
    
    line1.font = Font.mediumSystemFont(13)
   
    if (logoIsWanted) addLogoToLine1(stack)

    data.usedPercentage = 58

    // change color of the remaining volume according to usage
    const line2 = list.addText(100-data.usedPercentage + "%")
    line2.font = Font.boldSystemFont(36)
    
    // rough calculate remainig percentage of this month 
    // adjust colors according to what's needed within rest of the month
    let availableMonthPercentage = (data.remainingSeconds / (31*86400)) * 100  // to ease calculation, it just takes 31 days
    let bufferPercentage = 5 
    // e.g. if 20% of month is gone (after the 6th of a month), yellow indication starts at 10% used Volume  (attention: 20% of the month gone means 80% still available)
    let yellowLevel = (100 - availableMonthPercentage) - (2*bufferPercentage) 
    if (yellowLevel < 5) yellowLevel = 5 // yellow indication does not earlier than 5%, even at the beginning of a month
    // e.g. if 20% of month is gone (after the 6th of a month), orange indication starts at 15% used Volume  (attention: 20% of the month gone means 80% still available)
    let orangeLevel = (100 - availableMonthPercentage) - bufferPercentage 
    if (orangeLevel < 10) orangeLevel = 10 // orange indication does not earlier than 10%, even at the beginning of a month
    // e.g. if 20% of month is gone (after the 6th of a month), red indication starts at 25% used Volume  (attention: 20% of the month gone means 80% still available)
    let redLevel = (100 - availableMonthPercentage) + bufferPercentage
    if (redLevel > 95) redLevel = 95 // red indication at 95%, even at the end of a month

    if (data.usedPercentage >= redLevel) line2.textColor = Color.red()
    else if (data.usedPercentage >= orangeLevel) line2.textColor = Color.orange()
    else if (data.usedPercentage >= yellowLevel) line2.textColor = Color.yellow()
    else line2.textColor = Color.green()

    let line3
    let line4
    
    if (showAvailableVolume) {
      let availableVolume = (data.initialVolume - data.usedVolume)/(1024*1024*1024)      
      let line3pre
      if (availableVolume <= 1) {  // GB -> MB
        availableVolume *= 1024
        line3pre = availableVolume.toFixed(0) + " MB"
      } else {
        line3pre = availableVolume.toFixed(2) + " GB"
      }
      line3pre = line3pre.replace(".", ",")
      line3 = list.addText(line3pre)
    
      line4 = list.addText("von " + data.initialVolumeStr + " verbleibend")
    } else {
     line3 = list.addText(data.usedVolumeStr)
     line4 = list.addText("von " + data.initialVolumeStr + " verbraucht")
    }
    line3.font = Font.boldSystemFont(13)
    line4.font = Font.mediumSystemFont(10)    

    list.addSpacer(5)
    
    let pbImageVolume = createProgressbar(data.usedPercentage/100, (100-availableMonthPercentage)/100, line2.textColor)
    if (pbImageVolume) {
      let stackImageVolume = list.addImage(pbImageVolume)
      stackImageVolume.imageSize = new Size(pbImageVolume.size.width, pbImageVolume.size.height) // for what ever reason, size has to be set again
    }
    
    list.addSpacer(7)

    let line5

    // alt text on line5 if local data instead of Telekom API data:
    if (api_online || !showIndicationIfAPIOffline) {
      let plan = (data.remainingSeconds ? "prepaid" : data.remainingTimeStr ? "postpaid" : "")
      switch (plan) {
        case "prepaid":
          let days = Math.floor(data.remainingSeconds / 86400)
          let hours = Math.floor((data.remainingSeconds % 86400) / 3600)
          let daysStr = ""
          let hoursStr = ""
          
          // To differentiate between single and multiple days/hours
          if (days > 0) {
            if (days == 1) {
              daysStr += days + " Tag "
            } else {
              daysStr += days + " Tage "
            }
          }
          
          if (hours > 0 && days < 5) {  // only display houers, if less than 5 days left
            if (hours == 1) {
               daysStr += hours + ((days > 0 && !showAvailableVolume) ? " Std." : " Stunde")
            } else {
               daysStr += hours + ((days > 0 && !showAvailableVolume) ? " Std." : " Stunden")  // if available Volume is shown, text can be a bit longer
            }
          }
              
          if (days == 0 && hours == 0) {
                (showAvailableVolume) ? line5 += "für < 1 Stunde" :  line5 += "< 1 Stunde übrig"
          } else {
             (showAvailableVolume) ? line5 = list.addText("für " + daysStr + hoursStr) : line5 = list.addText(daysStr + hoursStr + " übrig")
          }
          line5.font = Font.mediumSystemFont(12)
          if (colorTimeToSignalEndOfMonth)  line5.textColor = (days < 3 ? Color.red() : Color.green())
          break;
      
        case "postpaid":
          line5 = list.addText("gültig bis:\n" + data.remainingTimeStr)
          line5.font = Font.mediumSystemFont(12)
          break;
      }
      
    } else {
        line5 = list.addText("API offline")
        line5.font = Font.boldSystemFont(12)
        line5.textColor = Color.orange()
    }
    //debugLine = list.addText("debug: " + true)
 
  } catch (err) {
    let errLine = list.addText("Error fetching JSON from https://pass.telekom.de/api/service/generic/v1/status")
    errLine.font = Font.mediumSystemFont(10) 
  }
  list.addSpacer (2)
  // Add time of last (successful) widget refresh:
  const currentTime = new Date()  // current timestamp
  let syncTime = new Date(data.dateStr) // timestamp of last sync in cellular environment
  const df = new DateFormatter()
  const wasFetchedToday = (currentTime.getDate() == syncTime.getDate() && currentTime.getMonth() == syncTime.getMonth() )  
  df.dateFormat = (wasFetchedToday ? "HH:mm" : "dd.MM. HH:mm")  
  let timeLabel = list.addText("↻ " + df.string(syncTime))
  timeLabel.font = Font.mediumSystemFont(10)
  // If APIOffline indication is not shown, the text is marked orange, if last sync is older than 1 day (86400 seconds * milliseconds)
  timeLabel.textColor = (!showIndicationIfAPIOffline && (currentTime - syncTime) > (86400*1000)) ? Color.orange() : Color.lightGray()
  list.addSpacer()
  return list
}


async function addLogoToLine1(stack) {
  const imageUrl = "https://www.telekom.de/resources/images/322188/meine-telekom-v3-graphical-256.png"
  let fm = FileManager.local()
  let dir = fm.documentsDirectory()
  let path = fm.joinPath(dir, "tel.png")
  stack.addSpacer()
  if (fm.fileExists(path)) { 
    let telekomImage = fm.readImage(path)
    let stackImage = stack.addImage(telekomImage)
    stackImage.rightAlignImage()
    stackImage.imageSize = new Size(16,16)
  } else {
    // download once
    let telekomImage = await loadImage(imageUrl)
    fm.writeImage(path, telekomImage)
    let stackImage = stack.addImage(telekomImage)
    stackImage.rightAlignImage()
    stackImage.imageSize = new Size(16,16)
  }
  stack.addText("   ")  // as there's no border on the right, but some spaces to get distance
}

async function loadImage(imgUrl) {
    const req = new Request(imgUrl)
    return await req.loadImage()
}


function createProgressbar(pVolume, pTime, color){
  const dc = new DrawContext()
  const pbWidth = 130
  const pbImageHeight = 11
  const pbBarHeight = 9
  
  // perpare empty image
  dc.size = new Size(pbWidth, pbImageHeight)
  dc.opaque = false
  dc.respectScreenScale = true
  
  // gray full month
  dc.setFillColor(new Color('#aaaaaa', 0.42)) // gray  
  const pathFull = new Path()
  pathFull.addRoundedRect(new Rect(0, (pbImageHeight-pbBarHeight)/2, pbWidth, pbBarHeight), 5, 4)
  dc.addPath(pathFull)
  dc.fillPath()
    
  // progress of used volume
  dc.setFillColor(color) 
  const pathProgress = new Path()
  let pathProgressWidth = minmax(pbWidth*pVolume, pbBarHeight, pbWidth)
  pathProgress.addRoundedRect(new Rect(0, (pbImageHeight-pbBarHeight)/2, pathProgressWidth, pbBarHeight), 5, 4)
  dc.addPath(pathProgress)
  dc.fillPath()

  dc.setFillColor(Color.dynamic(Color.black(), Color.white()))

  //dc.setFillColor(Color.blue()) 
  const pathDayMarker = new Path()
  pathDayMarker.addRoundedRect(new Rect( minmax((pbWidth-pbBarHeight)*pTime, 0, pbWidth-pbBarHeight)    , 0, 2, pbImageHeight), 2, 2)
  dc.addPath(pathDayMarker)
  dc.fillPath()
  
  return dc.getImage()
}

function minmax(num, min, max){
  return Math.min(Math.max(num, min), max)
}

//EOF
