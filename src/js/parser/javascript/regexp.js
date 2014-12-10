import _ from 'lodash';
import Base from './base.js';

export default _.extend({}, Base, {
  type: 'regexp',

  render() {
    var self = this;

    _.each(this.matches(), match => {
      match.container = self.container.group();
      match.render();
      return match.container;
    });
  },

  position() {
    var self = this,
        center,
        positions,
        totalHeight,
        verticalCenter,
        matches = this.matches(),
        includeLines = (matches.length > 1),
        paths = [];

    _.invoke(matches, 'position');

    positions = _.chain(matches)
      .map(match => {
        return {
          match,
          box: match.getBBox()
        };
      });
    center = positions.reduce((center, pos) => {
      return Math.max(center, pos.box.cx);
    }, 0).value();

    totalHeight = positions.reduce((offset, pos) => {
      pos.match.container.transform(Snap.matrix()
        .translate(center - pos.box.cx + (includeLines ? 20 : 0), offset));

      return offset + pos.box.height + 5;
    }, 0).value() - 5;

    verticalCenter = totalHeight / 2

    if (includeLines) {
      positions.each(pos => {
        var box = pos.match.getBBox(),
            direction = box.cy > verticalCenter ? 1 : -1,
            pathStr;

        pathStr = (verticalCenter === box.cy) ?
          'M0,{center}H{side}' :
          'M0,{center}q10,0 10,{d}V{target}q0,{d} 10,{d}H{side}';

        paths.push(Snap.format(pathStr, {
          center: verticalCenter,
          target: box.cy - 10 * direction,
          side: box.x,
          d: 10 * direction
        }));
      });

      this.container.path(paths.join(''))
        .clone().transform(Snap.matrix()
          .scale(-1, 1, center + 20, 0));
    }
  },

  matches() {
    return [this._match].concat(_.map(this._alternates.elements, _.property('match')));
  }
});
