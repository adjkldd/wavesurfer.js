import Drawer from './drawer';

export default class RealtimeDrawer extends Drawer {
    constructor(container, params) {
        super(container, params);
    }

    init() {
        this.createWrapper();
        this.wave = this.wrapper.appendChild(
            this.style(document.createElement('canvas'), {
                position: 'absolute',
                zIndex: 2,
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none'
            })
        );

        this.waveCtx = this.wave.getContext('2d');
        this.waveCtx.fillStyle = this.params.waveColor;

        let bgCanvas = document.createElement('canvas');
        this.bgWaveCtx = bgCanvas.getContext('2d');
        bgCanvas.width = this.waveCtx.canvas.width * 2;
        bgCanvas.height = this.waveCtx.canvas.height;
        this.bgWaveCtx.fillStyle = this.params.waveColor;

        this.x = 0;
    }

    drawMiddleLine() {
        //绘制一条中线
        let centerHeight = 1;
        let height = this.waveCtx.canvas.height;
        let width = this.waveCtx.canvas.width;
        let originY = height / 2;
        if (centerHeight) {
            var y = originY - Math.floor(centerHeight / 2);
            this.waveCtx.fillRect(0, y, width, centerHeight);
        }
    }

    updateCursor() {}

    updateSize() {}

    // https://github.com/xiangyuecn/Recorder/blob/master/src/extensions/wavesurfer.view.js
    drawWave(buffer) {
        if (!(buffer instanceof Uint8Array)) {
            return;
        }

        var ctx = this.bgWaveCtx;
        var scale = 1;
        var width = this.waveCtx.canvas.width;
        var width2 = this.bgWaveCtx.canvas.width;
        var height = this.waveCtx.canvas.height;
        var lineWidth = 1 * scale; //一条线占用1个单位长度

        //计算高度位置
        var heightY = height / 2;
        var originY = heightY;

        //计算绘制占用长度
        var pointCount = 1;

        var x = this.x;
        var step = buffer.length / pointCount;
        for (var i = 0, idx = 0; i < pointCount; i++) {
            var j = Math.floor(idx);
            var end = Math.floor(idx + step);
            idx += step;

            //寻找区间内最大值
            var max = 0;
            for (; j < end; j++) {
                max = Math.max(max, Math.abs(buffer[j]));
            }

            //计算高度
            var h = ((max - 128) * heightY) / 128;

            //绘制上半部分
            ctx.fillRect(x, originY - h, lineWidth, h);

            //绘制下半部分
            ctx.fillRect(x, originY, lineWidth, h);

            x += lineWidth;
            //超过卷轴宽度，移动画布第二个窗口内容到第一个窗口
            if (x >= width2) {
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(
                    ctx.canvas,
                    width,
                    0,
                    width,
                    height,
                    0,
                    0,
                    width,
                    height
                );
                ctx.clearRect(width, 0, width, height);
                x = width;
            }
        }
        this.x = x;

        //***画回到显示区域***
        ctx = this.waveCtx;
        ctx.clearRect(0, 0, width, height);

        this.drawMiddleLine();

        //画回画布
        var srcX = 0,
            srcW = x,
            destX = 0;
        if (srcW > width) {
            srcX = srcW - width;
            srcW = width;
        } else {
            destX = width - srcW;
        }

        var direction = 1;
        if (direction == -1) {
            //由右往左
            ctx.drawImage(
                this.bgWaveCtx.canvas,
                srcX,
                0,
                srcW,
                height,
                destX,
                0,
                srcW,
                height
            );
        } else {
            //由左往右
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(
                this.bgWaveCtx.canvas,
                srcX,
                0,
                srcW,
                height,
                -width + destX,
                0,
                srcW,
                height
            );
            ctx.restore();
        }
    }

    clearWave() {}

    updateProgress(position) {}
}
