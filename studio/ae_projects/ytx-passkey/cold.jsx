app.beginSuppressDialogs();
app.newProject();

var comp = app.project.items.addComp("cold", 1920, 1080, 1, 12, 30);
comp.bgColor = [243 / 255, 239 / 255, 230 / 255];

function rgb(h) {
  return [
    parseInt(h.substr(0, 2), 16) / 255,
    parseInt(h.substr(2, 2), 16) / 255,
    parseInt(h.substr(4, 2), 16) / 255,
  ];
}
var ink = rgb("16130f");
var paper = rgb("f3efe6");
var amber = rgb("c45c12");
var wash = rgb("f3ddc8");

function place(layer, x, y, w, h) {
  layer.property("Position").setValue([x + w / 2, y + h / 2]);
}

function box(name, hex, x, y, w, h) {
  var layer = comp.layers.addSolid(rgb(hex), name, w, h, 1);
  place(layer, x, y, w, h);
  return layer;
}

function words(str, size, hex, x, y, w) {
  var layer = comp.layers.addText(str);
  var prop = layer.property("Source Text");
  var doc = prop.value;
  doc.fontSize = size;
  doc.fillColor = rgb(hex);
  doc.font = "Segoe UI";
  doc.applyFill = true;
  doc.justification = ParagraphJustification.LEFT_JUSTIFY;
  try { doc.fontStyle = "Bold"; } catch (e) {}
  prop.setValue(doc);
  layer.property("Position").setValue([x, y]);
  return layer;
}

var shadow = box("shadow", "16130f", 210, 150, 1480, 760);
var sheet = box("sheet", "f3efe6", 200, 140, 1480, 760);
var head = box("head", "16130f", 200, 140, 1480, 88);
words("Account security", 36, "f3efe6", 240, 196);
words("The second key", 28, "f3efe6", 1280, 192);

var passLayers = [];
function passBox(name, hex, x, y, w, h) {
  var layer = box(name, hex, x, y, w, h);
  passLayers.push(layer);
  return layer;
}
var pass = passBox("password-row", "f3efe6", 240, 280, 1400, 148);
passBox("password-edge", "16130f", 240, 280, 1400, 4);
passBox("password-edge-b", "16130f", 240, 424, 1400, 4);
passBox("password-edge-l", "16130f", 240, 280, 4, 148);
passBox("password-edge-r", "16130f", 1636, 280, 4, 148);
passLayers.push(words("Password", 28, "6b645c", 280, 360));
passLayers.push(words("••••••••••", 40, "16130f", 520, 368));
var strike = passBox("strike", "16130f", 520, 348, 900, 4);
strike.property("Anchor Point").setValue([0, 2]);
strike.property("Position").setValue([520, 350]);
strike.property("Scale").setValueAtTime(1.9, [0, 100]);
strike.property("Scale").setValueAtTime(2.55, [100, 100]);
for (var i = 0; i < passLayers.length; i++) passLayers[i].outPoint = 3.1;

var own = box("own-row", "f3efe6", 240, 280, 1400, 148);
own.inPoint = 3.1;
box("own-top", "16130f", 240, 280, 1400, 4).inPoint = 3.1;
box("own-bot", "16130f", 240, 424, 1400, 4).inPoint = 3.1;
words("Passkey · this PC", 36, "16130f", 360, 340).inPoint = 3.1;
words("The private half never leaves", 28, "6b645c", 360, 388).inPoint = 3.1;
var signed = words("Signed in", 28, "16130f", 1320, 360);
signed.inPoint = 4.4;
signed.property("Opacity").setValueAtTime(4.4, 0);
signed.property("Opacity").setValueAtTime(4.75, 100);

function parentKeep(child, parent) {
  var childPos = child.property("Position").value;
  var parentPos = parent.property("Position").value;
  child.parent = parent;
  child.property("Position").setValue([childPos[0] - parentPos[0], childPos[1] - parentPos[1]]);
}
var other = box("other-row", "f3ddc8", 240, 460, 1400, 148);
var bar = box("amber-bar", "c45c12", 240, 460, 10, 148);
var otherTitle = words("Windows PC", 36, "16130f", 360, 520);
var otherSub = words("Added just now · not this one", 28, "6b645c", 360, 568);
parentKeep(bar, other);
parentKeep(otherTitle, other);
parentKeep(otherSub, other);
other.inPoint = 6.2;
bar.inPoint = 6.2;
otherTitle.inPoint = 6.2;
otherSub.inPoint = 6.2;
other.property("Position").setValueAtTime(6.2, [240 + 700 + 64, 460 + 74]);
other.property("Position").setValueAtTime(6.67, [240 + 700, 460 + 74]);
other.property("Opacity").setValueAtTime(6.2, 0);
other.property("Opacity").setValueAtTime(6.67, 100);

var hook = words("The passkey worked. It just wasn't theirs.", 44, "16130f", 240, 700);
hook.inPoint = 8.4;
hook.property("Opacity").setValueAtTime(8.4, 0);
hook.property("Opacity").setValueAtTime(8.8, 100);

var folder = new Folder("C:/Users/Admin/Documents/GitHub/AE/studio/ae_projects/ytx-passkey");
if (!folder.exists) folder.create();
var proj = new File("C:/Users/Admin/Documents/GitHub/AE/studio/ae_projects/ytx-passkey/cold.aep");
app.project.save(proj);
var log = new File("C:/Users/Admin/Documents/GitHub/AE/studio/ae_projects/ytx-passkey/cold-jsx.log");
log.open("w");
log.write("saved");
log.close();
app.quit();
