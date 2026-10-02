// Original short examples written for this project; no commercial dictionary corpus.
export const BOOKS = [
  { id:'animals', title:'动物好朋友', en:'Animal friends', emoji:'🐾', color:'#f5d99d', description:'去森林里，认识16位新朋友。' },
  { id:'food', title:'美味小厨房', en:'Little kitchen', emoji:'🍓', color:'#f1c8b8', description:'水果、早餐，还有喜欢的冰淇淋。' },
  { id:'nature', title:'发现大自然', en:'Outside wonders', emoji:'🌱', color:'#dce7c6', description:'抬头看天空，低头找小花。' },
  { id:'home', title:'温暖的家', en:'A cozy home', emoji:'🏡', color:'#e8dcc6', description:'用英语，认识身边的小物件。' },
  { id:'school', title:'快乐上学啦', en:'School days', emoji:'🎒', color:'#d6e5e9', description:'把好奇心装进书包里。' },
  { id:'actions', title:'一起动起来', en:'Let’s move', emoji:'🪁', color:'#e6d7eb', description:'跑一跑、跳一跳，边玩边记。' }
];
const rows = {
animals: `cat|猫|/kæt/|🐈|The cat sits on a mat.|小猫坐在垫子上。
dog|狗|/dɒɡ/|🐕|My dog likes to play.|我的小狗喜欢玩耍。
rabbit|兔子|/ˈræbɪt/|🐇|The rabbit has long ears.|兔子有长长的耳朵。
bird|鸟|/bɜːd/|🐦|A bird is in the tree.|一只鸟在树上。
fish|鱼|/fɪʃ/|🐟|The fish swims in the water.|鱼在水里游泳。
duck|鸭子|/dʌk/|🦆|The duck has yellow feet.|鸭子有黄色的脚。
horse|马|/hɔːs/|🐎|The horse can run fast.|马会跑得很快。
cow|奶牛|/kaʊ/|🐄|The cow eats grass.|奶牛吃草。
sheep|绵羊|/ʃiːp/|🐑|The sheep is white.|绵羊是白色的。
pig|猪|/pɪɡ/|🐖|The pig has a pink nose.|小猪有一个粉色的鼻子。
panda|大熊猫|/ˈpændə/|🐼|The panda likes bamboo.|大熊猫喜欢竹子。
bear|熊|/beə/|🐻|The bear is big.|这只熊很大。
lion|狮子|/ˈlaɪən/|🦁|The lion has a long tail.|狮子有一条长尾巴。
tiger|老虎|/ˈtaɪɡə/|🐯|The tiger walks slowly.|老虎慢慢地走。
monkey|猴子|/ˈmʌŋki/|🐒|The monkey is in a tree.|猴子在树上。
elephant|大象|/ˈelɪfənt/|🐘|The elephant has big ears.|大象有大大的耳朵。`,
food: `apple|苹果|/ˈæpəl/|🍎|I have a red apple.|我有一个红苹果。
banana|香蕉|/bəˈnɑːnə/|🍌|This banana is yellow.|这根香蕉是黄色的。
orange|橙子|/ˈɒrɪndʒ/|🍊|Let us share an orange.|我们一起吃一个橙子吧。
pear|梨|/peə/|🍐|The pear is sweet.|这个梨很甜。
grape|葡萄|/ɡreɪp/|🍇|I can see a green grape.|我能看见一颗绿葡萄。
strawberry|草莓|/ˈstrɔːbəri/|🍓|The strawberry is small.|这颗草莓很小。
bread|面包|/bred/|🍞|I eat bread for breakfast.|我早餐吃面包。
milk|牛奶|/mɪlk/|🥛|There is milk in my cup.|我的杯子里有牛奶。
egg|鸡蛋|/eɡ/|🥚|There is an egg on the plate.|盘子里有一个鸡蛋。
rice|米饭|/raɪs/|🍚|I like rice with vegetables.|我喜欢米饭配蔬菜。
cake|蛋糕|/keɪk/|🍰|This cake is for you.|这个蛋糕是给你的。
water|水|/ˈwɔːtə/|💧|Please drink some water.|请喝一些水。
carrot|胡萝卜|/ˈkærət/|🥕|The rabbit eats a carrot.|兔子吃一根胡萝卜。
tomato|番茄|/təˈmɑːtəʊ/|🍅|This tomato is red.|这个番茄是红色的。
potato|土豆|/pəˈteɪtəʊ/|🥔|I can cook a potato.|我会煮土豆。
ice cream|冰淇淋|/ˌaɪs ˈkriːm/|🍦|My ice cream is cold.|我的冰淇淋凉凉的。`,
nature: `sun|太阳|/sʌn/|☀️|The sun is bright today.|今天的太阳很明亮。
moon|月亮|/muːn/|🌙|Look at the moon!|看月亮！
star|星星|/stɑː/|⭐|I can see a star.|我能看见一颗星星。
sky|天空|/skaɪ/|🌤️|The sky is blue.|天空是蓝色的。
cloud|云|/klaʊd/|☁️|That cloud looks like a dog.|那朵云看起来像一只狗。
rain|雨|/reɪn/|🌧️|The rain helps flowers grow.|雨水帮助花朵生长。
snow|雪|/snəʊ/|❄️|The snow is soft and white.|雪又软又白。
wind|风|/wɪnd/|🍃|The wind moves the leaves.|风吹动了树叶。
tree|树|/triː/|🌳|This tree is very tall.|这棵树很高。
flower|花|/ˈflaʊə/|🌼|I found a yellow flower.|我找到了一朵黄色的花。
leaf|树叶|/liːf/|🍂|A leaf falls to the ground.|一片树叶落到了地上。
grass|草|/ɡrɑːs/|🌿|The grass is green.|草是绿色的。
river|河流|/ˈrɪvə/|🏞️|The river is long.|这条河很长。
mountain|山|/ˈmaʊntən/|⛰️|The mountain is high.|这座山很高。
sea|大海|/siː/|🌊|We can play by the sea.|我们可以在海边玩。
rainbow|彩虹|/ˈreɪnbəʊ/|🌈|A rainbow is in the sky.|天空中有一道彩虹。`,
home: `house|房子|/haʊs/|🏠|Our house has a red door.|我们的房子有一扇红门。
door|门|/dɔː/|🚪|Please open the door.|请打开门。
window|窗户|/ˈwɪndəʊ/|🪟|I can see a bird through the window.|我透过窗户看见一只鸟。
bed|床|/bed/|🛏️|My bed is soft.|我的床很软。
chair|椅子|/tʃeə/|🪑|Sit on the chair, please.|请坐在椅子上。
table|桌子|/ˈteɪbəl/|🪵|The book is on the table.|书在桌子上。
lamp|台灯|/læmp/|💡|The lamp is beside my bed.|台灯在我的床边。
clock|钟|/klɒk/|🕰️|The clock is on the wall.|钟在墙上。
cup|杯子|/kʌp/|☕|This is my blue cup.|这是我的蓝杯子。
plate|盘子|/pleɪt/|🍽️|Put the apple on the plate.|把苹果放在盘子上。
spoon|勺子|/spuːn/|🥄|I use a spoon for soup.|我用勺子喝汤。
key|钥匙|/kiː/|🔑|The key is in my bag.|钥匙在我的包里。
sofa|沙发|/ˈsəʊfə/|🛋️|We sit on the sofa.|我们坐在沙发上。
mirror|镜子|/ˈmɪrə/|🪞|I smile at the mirror.|我对着镜子微笑。
soap|肥皂|/səʊp/|🧼|Wash your hands with soap.|用肥皂洗手。
towel|毛巾|/ˈtaʊəl/|🧺|My towel is clean.|我的毛巾很干净。`,
school: `book|书|/bʊk/|📘|I read a book every day.|我每天读一本书。
pen|钢笔|/pen/|🖊️|This pen is blue.|这支钢笔是蓝色的。
pencil|铅笔|/ˈpensəl/|✏️|I draw with a pencil.|我用铅笔画画。
bag|包|/bæɡ/|🎒|My bag is under the chair.|我的包在椅子下面。
ruler|尺子|/ˈruːlə/|📏|May I use your ruler?|我可以用你的尺子吗？
eraser|橡皮|/ɪˈreɪzə/|🧽|I need an eraser.|我需要一块橡皮。
desk|书桌|/desk/|📚|My desk is tidy.|我的书桌很整洁。
teacher|老师|/ˈtiːtʃə/|🧑‍🏫|Our teacher is kind.|我们的老师很亲切。
student|学生|/ˈstjuːdənt/|🧑‍🎓|I am a student.|我是一名学生。
friend|朋友|/frend/|🧑‍🤝‍🧑|You are my friend.|你是我的朋友。
school|学校|/skuːl/|🏫|I walk to school.|我步行去学校。
classroom|教室|/ˈklɑːsruːm/|🪑|Our classroom is bright.|我们的教室很明亮。
paper|纸|/ˈpeɪpə/|📄|I draw a cat on the paper.|我在纸上画了一只猫。
crayon|蜡笔|/ˈkreɪən/|🖍️|I have a green crayon.|我有一支绿色蜡笔。
picture|图片|/ˈpɪktʃə/|🖼️|This picture shows a tree.|这张图片上有一棵树。
lesson|课|/ˈlesən/|🔔|Our English lesson starts now.|我们的英语课现在开始。`,
actions: `run|跑|/rʌn/|🏃|I run in the park.|我在公园里跑步。
jump|跳|/dʒʌmp/|🐇|The rabbit can jump.|兔子会跳。
walk|走|/wɔːk/|🚶|Let us walk together.|我们一起走吧。
swim|游泳|/swɪm/|🏊|The fish can swim.|鱼会游泳。
read|阅读|/riːd/|📖|I like to read stories.|我喜欢读故事。
write|写|/raɪt/|✍️|I can write my name.|我会写自己的名字。
draw|画画|/drɔː/|🎨|Let us draw a rainbow.|我们来画一道彩虹吧。
sing|唱歌|/sɪŋ/|🎤|We sing a happy song.|我们唱一首快乐的歌。
dance|跳舞|/dɑːns/|💃|I like to dance with you.|我喜欢和你一起跳舞。
sleep|睡觉|/sliːp/|😴|The baby needs to sleep.|宝宝需要睡觉。
eat|吃|/iːt/|🍴|I eat an apple after lunch.|我午饭后吃一个苹果。
drink|喝|/drɪŋk/|🥤|I drink water after I run.|我跑步后喝水。
play|玩耍|/pleɪ/|🧸|We play with a ball.|我们一起玩球。
listen|听|/ˈlɪsən/|👂|Listen to the birds.|听听鸟儿的声音。
look|看|/lʊk/|👀|Look at this little dog.|看看这只小狗。
smile|微笑|/smaɪl/|😊|You make me smile.|你让我露出微笑。`
};
export const WORDS = Object.entries(rows).flatMap(([book, text]) => text.split('\n').map((line, i) => {
  const [word, meaning, ipa, emoji, example, translation] = line.split('|');
  return { id:`${book}-${i + 1}`, book, word, meaning, ipa, emoji, example, translation };
}));
export const byId = Object.fromEntries(WORDS.map(word => [word.id, word]));
