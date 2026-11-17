// Regenerate the approved typographic artwork on macOS. Font files are not bundled.
import AppKit
import CoreText
let root=URL(fileURLWithPath:#filePath).deletingLastPathComponent().deletingLastPathComponent()
let repo=root.deletingLastPathComponent()
let font=CTFontCreateWithName("Arial-Black" as CFString,100,nil)
guard (CTFontCopyPostScriptName(font) as String)=="Arial-Black" else { fatalError("Install Arial Black to regenerate artwork") }
func glyph(_ char:Character)->CGPath {
 var code=Array(String(char).utf16)[0];var glyph:CGGlyph=0
 CTFontGetGlyphsForCharacters(font,&code,&glyph,1)
 let p=CTFontCreatePathForGlyph(font,glyph,nil)!;let b=p.boundingBoxOfPath
 var t=CGAffineTransform(translationX:-b.minX,y:-b.minY);return p.copy(using:&t)!
}
let t=glyph("T"),f=glyph("F");let tb=t.boundingBoxOfPath,fb=f.boundingBoxOfPath
let mark=CGMutablePath();mark.addPath(t)
mark.addPath(f,transform:CGAffineTransform(a:-1,b:0,c:0,d:-1,tx:tb.width+14+fb.width,ty:fb.height))
let word=CGMutablePath();var x:CGFloat=0
for c in "TONFELD" { let p=glyph(c);word.addPath(p,transform:CGAffineTransform(translationX:x,y:0));x+=p.boundingBoxOfPath.width+5 }
func fitted(_ path:CGPath,_ rect:CGRect)->CGPath {
 let b=path.boundingBoxOfPath;let scale=min(rect.width/b.width,rect.height/b.height)
 var transform=CGAffineTransform(a:scale,b:0,c:0,d:scale,tx:rect.midX-b.midX*scale,ty:rect.midY-b.midY*scale)
 return path.copy(using:&transform)!
}
func svg(_ path:CGPath,width:CGFloat,height:CGFloat,fill:String)->String {
 var flip=CGAffineTransform(a:1,b:0,c:0,d:-1,tx:0,ty:height);let p=path.copy(using:&flip)!;var d=""
 func point(_ p:CGPoint)->String { String(format:"%.3f %.3f",Double(p.x),Double(p.y)) }
 p.applyWithBlock { ptr in let e=ptr.pointee;switch e.type {
 case .moveToPoint:d+="M"+point(e.points[0]);case .addLineToPoint:d+="L"+point(e.points[0]);case .addQuadCurveToPoint:d+="Q"+point(e.points[0])+" "+point(e.points[1]);case .addCurveToPoint:d+="C"+point(e.points[0])+" "+point(e.points[1])+" "+point(e.points[2]);case .closeSubpath:d+="Z";@unknown default:break } }
 return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 \(Int(width)) \(Int(height))\"><path fill=\"\(fill)\" d=\"\(d)\"/></svg>\n"
}
func write(_ data:Data,_ url:URL){try! FileManager.default.createDirectory(at:url.deletingLastPathComponent(),withIntermediateDirectories:true);try! data.write(to:url)}
let markPath=fitted(mark,CGRect(x:12,y:12,width:232,height:136)),wordPath=fitted(word,CGRect(x:2,y:4,width:796,height:120))
for (name,p,w,h) in [("mark",markPath,CGFloat(256),CGFloat(160)),("wordmark",wordPath,CGFloat(800),CGFloat(128))] {
 write(svg(p,width:w,height:h,fill:"#e9e5d9").data(using:.utf8)!,root.appendingPathComponent("src/renderer/assets/tonfeld-\(name).svg"))
 write(svg(p,width:w,height:h,fill:"#171918").data(using:.utf8)!,repo.appendingPathComponent("docs/branding/tonfeld-\(name).svg"))
}
func png(_ size:Int,_ template:Bool=false)->Data {
 let bitmap=NSBitmapImageRep(bitmapDataPlanes:nil,pixelsWide:size,pixelsHigh:size,bitsPerSample:8,samplesPerPixel:4,hasAlpha:true,isPlanar:false,colorSpaceName:.deviceRGB,bytesPerRow:0,bitsPerPixel:0)!
 let ctx=NSGraphicsContext(bitmapImageRep:bitmap)!.cgContext;let s=CGFloat(size)
 if !template {ctx.setFillColor(CGColor(gray:0.095,alpha:1));ctx.addPath(CGPath(roundedRect:CGRect(x:s*0.04,y:s*0.04,width:s*0.92,height:s*0.92),cornerWidth:s*0.19,cornerHeight:s*0.19,transform:nil));ctx.fillPath()}
 ctx.setFillColor(template ? CGColor(gray:0,alpha:1):CGColor(red:0.91,green:0.90,blue:0.86,alpha:1));ctx.addPath(fitted(mark,CGRect(x:s*0.16,y:s*0.19,width:s*0.68,height:s*0.62)));ctx.fillPath()
 return bitmap.representation(using:.png,properties:[:])!
}
write(png(1024),root.appendingPathComponent("assets/icon.png"));write(png(18,true),root.appendingPathComponent("assets/trayTemplate.png"));write(png(36,true),root.appendingPathComponent("assets/trayTemplate@2x.png"))
for size in [16,32,48,128] {write(png(size),repo.appendingPathComponent("extension/icons/icon\(size).png"))}
print("Generated TONFELD wordmark, rotated-F monogram, app/tray and companion icons")
