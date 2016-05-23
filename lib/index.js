"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.expireNow = exports.unsafeDeleteAtom = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _ramda = require("ramda");

var R = _interopRequireWildcard(_ramda);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function show(x) {
  switch (typeof x === "undefined" ? "undefined" : _typeof(x)) {
    case "string":
    case "object":
      return JSON.stringify(x);
    default:
      return "" + x;
  }
}

var storages = new WeakMap();
var usedOptions = undefined;
if (process.NODE_ENV !== "production") usedOptions = new WeakMap();

var getAtoms = function getAtoms(storage) {
  var atoms = storages.get(storage);
  if (!atoms) storages.set(storage, atoms = {});
  return atoms;
};

var tryParse = function tryParse(json) {
  try {
    return JSON.parse(json);
  } catch (error) {
    return error;
  }
};

var seemsValid = function seemsValid(data) {
  return data && data.constructor === Object && "value" in data;
};

var getValue = function getValue(storage, key, schema, defaultValue, time, atom) {
  storage.getItem(key, function (error, json) {
    if (!json) return;

    var data = tryParse(json);
    if (!seemsValid(data) || !R.equals(data.schema, schema) || R.equals(data.value, defaultValue)) {
      storage.removeItem(key);
      return;
    }

    atom.set(data.value);
  });
};

var unsafeDeleteAtom = exports.unsafeDeleteAtom = function unsafeDeleteAtom(_ref) {
  var storage = _ref.storage;
  var key = _ref.key;

  var atoms = getAtoms(storage);
  delete atoms[key];
};

var expireNow = exports.expireNow = function expireNow(_ref2) {
  var storage = _ref2.storage;
  var regex = _ref2.regex;
  var unsafeDeleteAtoms = _ref2.unsafeDeleteAtoms;

  for (var i = 0; i < storage.length; ++i) {
    var key = storage.key(i);

    if (!regex.test(key)) continue;

    var data = tryParse(storage.getItem(key));
    if (!seemsValid(data)) continue;

    if (data.expires <= Date.now()) {
      storage.removeItem(key);

      if (unsafeDeleteAtoms) unsafeDeleteAtom({ storage: storage, key: key });
    }
  }
};

exports.default = function (_ref3) {
  var key = _ref3.key;
  var storage = _ref3.storage;

  var options = _objectWithoutProperties(_ref3, ["key", "storage"]);

  var _options = options;
  var defaultValue = _options.value;
  var Atom = _options.Atom;
  var time = _options.time;
  var schema = _options.schema;
  var debounce = _options.debounce;

  var atoms = getAtoms(storage);

  var atom = atoms[key];
  if (!atom) {
    atoms[key] = atom = Atom(defaultValue);
    getValue(storage, key, schema, defaultValue, time, atom);

    if (process.NODE_ENV !== "production") usedOptions.set(atom, options);

    var changes = atom.changes();
    if (0 <= debounce) changes = changes.debounce(debounce);

    changes.onValue(function (value) {
      if (R.equals(value, defaultValue)) {
        storage.removeItem(key);
      } else {
        var data = { value: value };

        if (schema !== undefined) data.schema = schema;

        if (0 <= time) data.expires = time + Date.now();

        storage.setItem(key, JSON.stringify(data, function (key, value) {
          var blacklist = options.blacklist || [];
          if (blacklist.find(function (x) {
            return x === key;
          })) {
            return undefined;
          } else {
            return value;
          }
        }));
      }
    });
  } else if (process.NODE_ENV !== "production") {
    var oldOptions = usedOptions.get(atom);
    for (var k in options) {
      if (!R.equals(options[k], oldOptions[k])) throw new Error("atom.storage: Created two atoms with same storage and key " + show(key) + ", but different " + show(k) + ": first " + show(oldOptions[k]) + " and later " + show(options[k]) + ".");
    }
  }

  return atom;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTs7SUFBWTs7Ozs7O0FBRVosU0FBUyxJQUFULENBQWMsQ0FBZCxFQUFpQjtBQUNmLGlCQUFlLDRDQUFmO0FBQ0EsU0FBSyxRQUFMLENBREE7QUFFQSxTQUFLLFFBQUw7QUFDRSxhQUFPLEtBQUssU0FBTCxDQUFlLENBQWYsQ0FBUCxDQURGO0FBRkE7QUFLRSxrQkFBVSxDQUFWLENBREY7QUFKQSxHQURlO0NBQWpCOztBQVVBLElBQU0sV0FBVyxJQUFJLE9BQUosRUFBWDtBQUNOLElBQUksdUJBQUo7QUFDQSxJQUFJLFFBQVEsUUFBUixLQUFxQixZQUFyQixFQUNGLGNBQWMsSUFBSSxPQUFKLEVBQWQsQ0FERjs7QUFHQSxJQUFNLFdBQVcsU0FBWCxRQUFXLFVBQVc7QUFDMUIsTUFBSSxRQUFRLFNBQVMsR0FBVCxDQUFhLE9BQWIsQ0FBUixDQURzQjtBQUUxQixNQUFJLENBQUMsS0FBRCxFQUNGLFNBQVMsR0FBVCxDQUFhLE9BQWIsRUFBc0IsUUFBUSxFQUFSLENBQXRCLENBREY7QUFFQSxTQUFPLEtBQVAsQ0FKMEI7Q0FBWDs7QUFPakIsSUFBTSxXQUFXLFNBQVgsUUFBVyxPQUFRO0FBQ3ZCLE1BQUk7QUFDRixXQUFPLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBUCxDQURFO0dBQUosQ0FFRSxPQUFPLEtBQVAsRUFBYztBQUNkLFdBQU8sS0FBUCxDQURjO0dBQWQ7Q0FIYTs7QUFRakIsSUFBTSxhQUNKLFNBREksVUFDSjtTQUFRLFFBQVEsS0FBSyxXQUFMLEtBQXFCLE1BQXJCLElBQStCLFdBQVcsSUFBWDtDQUEvQzs7QUFFRixJQUFNLFdBQVcsU0FBWCxRQUFXLENBQUMsT0FBRCxFQUFVLEdBQVYsRUFBZSxNQUFmLEVBQXVCLFlBQXZCLEVBQXFDLElBQXJDLEVBQTJDLElBQTNDLEVBQW9EO0FBQ25FLFVBQVEsT0FBUixDQUFnQixHQUFoQixFQUFxQixVQUFDLEtBQUQsRUFBUSxJQUFSLEVBQWU7QUFDbEMsUUFBSSxDQUFDLElBQUQsRUFDRixPQURGOztBQUdBLFFBQU0sT0FBTyxTQUFTLElBQVQsQ0FBUCxDQUo0QjtBQUtsQyxRQUFJLENBQUMsV0FBVyxJQUFYLENBQUQsSUFBcUIsQ0FBQyxFQUFFLE1BQUYsQ0FBUyxLQUFLLE1BQUwsRUFBYSxNQUF0QixDQUFELElBQWtDLEVBQUUsTUFBRixDQUFTLEtBQUssS0FBTCxFQUFZLFlBQXJCLENBQXZELEVBQTJGO0FBQzdGLGNBQVEsVUFBUixDQUFtQixHQUFuQixFQUQ2RjtBQUU3RixhQUY2RjtLQUEvRjs7QUFLQSxTQUFLLEdBQUwsQ0FBUyxLQUFLLEtBQUwsQ0FBVCxDQVZrQztHQUFmLENBQXJCLENBRG1FO0NBQXBEOztBQWdCVixJQUFNLDhDQUFtQixTQUFuQixnQkFBbUIsT0FBb0I7TUFBbEIsdUJBQWtCO01BQVQsZUFBUzs7QUFDbEQsTUFBTSxRQUFRLFNBQVMsT0FBVCxDQUFSLENBRDRDO0FBRWxELFNBQU8sTUFBTSxHQUFOLENBQVAsQ0FGa0Q7Q0FBcEI7O0FBS3pCLElBQU0sZ0NBQVksU0FBWixTQUFZLFFBQXlDO01BQXZDLHdCQUF1QztNQUE5QixvQkFBOEI7TUFBdkIsNENBQXVCOztBQUNoRSxPQUFLLElBQUksSUFBRSxDQUFGLEVBQUssSUFBRSxRQUFRLE1BQVIsRUFBZ0IsRUFBRSxDQUFGLEVBQUs7QUFDbkMsUUFBTSxNQUFNLFFBQVEsR0FBUixDQUFZLENBQVosQ0FBTixDQUQ2Qjs7QUFHbkMsUUFBSSxDQUFDLE1BQU0sSUFBTixDQUFXLEdBQVgsQ0FBRCxFQUNGLFNBREY7O0FBR0EsUUFBTSxPQUFPLFNBQVMsUUFBUSxPQUFSLENBQWdCLEdBQWhCLENBQVQsQ0FBUCxDQU42QjtBQU9uQyxRQUFJLENBQUMsV0FBVyxJQUFYLENBQUQsRUFDRixTQURGOztBQUdBLFFBQUksS0FBSyxPQUFMLElBQWdCLEtBQUssR0FBTCxFQUFoQixFQUE0QjtBQUM5QixjQUFRLFVBQVIsQ0FBbUIsR0FBbkIsRUFEOEI7O0FBRzlCLFVBQUksaUJBQUosRUFDRSxpQkFBaUIsRUFBQyxnQkFBRCxFQUFVLFFBQVYsRUFBakIsRUFERjtLQUhGO0dBVkY7Q0FEdUI7O2tCQW9CVixpQkFBZ0M7TUFBOUIsZ0JBQThCO01BQXpCLHdCQUF5Qjs7TUFBYiw4REFBYTs7aUJBQ2UsUUFEZjtNQUMvQix3QkFBUCxNQURzQztNQUNqQixxQkFEaUI7TUFDWCxxQkFEVztNQUNMLHlCQURLO01BQ0csNkJBREg7O0FBRzdDLE1BQU0sUUFBUSxTQUFTLE9BQVQsQ0FBUixDQUh1Qzs7QUFLN0MsTUFBSSxPQUFPLE1BQU0sR0FBTixDQUFQLENBTHlDO0FBTTdDLE1BQUksQ0FBQyxJQUFELEVBQU87QUFDVCxVQUFNLEdBQU4sSUFBYSxPQUFPLEtBQUssWUFBTCxDQUFQLENBREo7QUFFVCxhQUFTLE9BQVQsRUFBa0IsR0FBbEIsRUFBdUIsTUFBdkIsRUFBK0IsWUFBL0IsRUFBNkMsSUFBN0MsRUFBbUQsSUFBbkQsRUFGUzs7QUFJVCxRQUFJLFFBQVEsUUFBUixLQUFxQixZQUFyQixFQUNGLFlBQVksR0FBWixDQUFnQixJQUFoQixFQUFzQixPQUF0QixFQURGOztBQUdBLFFBQUksVUFBVSxLQUFLLE9BQUwsRUFBVixDQVBLO0FBUVQsUUFBSSxLQUFLLFFBQUwsRUFDRixVQUFVLFFBQVEsUUFBUixDQUFpQixRQUFqQixDQUFWLENBREY7O0FBR0EsWUFBUSxPQUFSLENBQWdCLGlCQUFTO0FBQ3ZCLFVBQUksRUFBRSxNQUFGLENBQVMsS0FBVCxFQUFnQixZQUFoQixDQUFKLEVBQW1DO0FBQ2pDLGdCQUFRLFVBQVIsQ0FBbUIsR0FBbkIsRUFEaUM7T0FBbkMsTUFFTztBQUNMLFlBQU0sT0FBTyxFQUFDLFlBQUQsRUFBUCxDQUREOztBQUdMLFlBQUksV0FBVyxTQUFYLEVBQ0YsS0FBSyxNQUFMLEdBQWMsTUFBZCxDQURGOztBQUdBLFlBQUksS0FBSyxJQUFMLEVBQ0YsS0FBSyxPQUFMLEdBQWUsT0FBTyxLQUFLLEdBQUwsRUFBUCxDQURqQjs7QUFHQSxnQkFBUSxPQUFSLENBQWdCLEdBQWhCLEVBQXFCLEtBQUssU0FBTCxDQUFlLElBQWYsRUFBcUIsVUFBQyxHQUFELEVBQU0sS0FBTixFQUFjO0FBQ3RELGNBQU0sWUFBWSxRQUFRLFNBQVIsSUFBcUIsRUFBckIsQ0FEb0M7QUFFdEQsY0FBSSxVQUFVLElBQVYsQ0FBZTttQkFBSyxNQUFNLEdBQU47V0FBTCxDQUFuQixFQUFtQztBQUNqQyxtQkFBTyxTQUFQLENBRGlDO1dBQW5DLE1BRU87QUFDTCxtQkFBTyxLQUFQLENBREs7V0FGUDtTQUZ3QyxDQUExQyxFQVRLO09BRlA7S0FEYyxDQUFoQixDQVhTO0dBQVgsTUFpQ08sSUFBSSxRQUFRLFFBQVIsS0FBcUIsWUFBckIsRUFBbUM7QUFDNUMsUUFBTSxhQUFhLFlBQVksR0FBWixDQUFnQixJQUFoQixDQUFiLENBRHNDO0FBRTVDLFNBQUssSUFBTSxDQUFOLElBQVcsT0FBaEIsRUFBeUI7QUFDdkIsVUFBSSxDQUFDLEVBQUUsTUFBRixDQUFTLFFBQVEsQ0FBUixDQUFULEVBQXFCLFdBQVcsQ0FBWCxDQUFyQixDQUFELEVBQ0YsTUFBTSxJQUFJLEtBQUosZ0VBQXVFLEtBQUssR0FBTCx5QkFBNEIsS0FBSyxDQUFMLGlCQUFrQixLQUFLLFdBQVcsQ0FBWCxDQUFMLG9CQUFpQyxLQUFLLFFBQVEsQ0FBUixDQUFMLE9BQXRKLENBQU4sQ0FERjtLQURGO0dBRks7O0FBUVAsU0FBTyxJQUFQLENBL0M2QztDQUFoQyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFIgZnJvbSBcInJhbWRhXCJcblxuZnVuY3Rpb24gc2hvdyh4KSB7XG4gIHN3aXRjaCAodHlwZW9mIHgpIHtcbiAgY2FzZSBcInN0cmluZ1wiOlxuICBjYXNlIFwib2JqZWN0XCI6XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHgpXG4gIGRlZmF1bHQ6XG4gICAgcmV0dXJuIGAke3h9YFxuICB9XG59XG5cbmNvbnN0IHN0b3JhZ2VzID0gbmV3IFdlYWtNYXAoKVxubGV0IHVzZWRPcHRpb25zXG5pZiAocHJvY2Vzcy5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIpXG4gIHVzZWRPcHRpb25zID0gbmV3IFdlYWtNYXAoKVxuXG5jb25zdCBnZXRBdG9tcyA9IHN0b3JhZ2UgPT4ge1xuICBsZXQgYXRvbXMgPSBzdG9yYWdlcy5nZXQoc3RvcmFnZSlcbiAgaWYgKCFhdG9tcylcbiAgICBzdG9yYWdlcy5zZXQoc3RvcmFnZSwgYXRvbXMgPSB7fSlcbiAgcmV0dXJuIGF0b21zXG59XG5cbmNvbnN0IHRyeVBhcnNlID0ganNvbiA9PiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoanNvbilcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gZXJyb3JcbiAgfVxufVxuXG5jb25zdCBzZWVtc1ZhbGlkID1cbiAgZGF0YSA9PiBkYXRhICYmIGRhdGEuY29uc3RydWN0b3IgPT09IE9iamVjdCAmJiBcInZhbHVlXCIgaW4gZGF0YVxuXG5jb25zdCBnZXRWYWx1ZSA9IChzdG9yYWdlLCBrZXksIHNjaGVtYSwgZGVmYXVsdFZhbHVlLCB0aW1lLCBhdG9tKSA9PiB7XG4gIHN0b3JhZ2UuZ2V0SXRlbShrZXksIChlcnJvciwganNvbik9PntcbiAgICBpZiAoIWpzb24pXG4gICAgICByZXR1cm5cblxuICAgIGNvbnN0IGRhdGEgPSB0cnlQYXJzZShqc29uKVxuICAgIGlmICghc2VlbXNWYWxpZChkYXRhKSB8fCAhUi5lcXVhbHMoZGF0YS5zY2hlbWEsIHNjaGVtYSkgfHwgUi5lcXVhbHMoZGF0YS52YWx1ZSwgZGVmYXVsdFZhbHVlKSkge1xuICAgICAgc3RvcmFnZS5yZW1vdmVJdGVtKGtleSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGF0b20uc2V0KGRhdGEudmFsdWUpO1xuICB9KTtcblxufVxuXG5leHBvcnQgY29uc3QgdW5zYWZlRGVsZXRlQXRvbSA9ICh7c3RvcmFnZSwga2V5fSkgPT4ge1xuICBjb25zdCBhdG9tcyA9IGdldEF0b21zKHN0b3JhZ2UpXG4gIGRlbGV0ZSBhdG9tc1trZXldXG59XG5cbmV4cG9ydCBjb25zdCBleHBpcmVOb3cgPSAoe3N0b3JhZ2UsIHJlZ2V4LCB1bnNhZmVEZWxldGVBdG9tc30pID0+IHtcbiAgZm9yIChsZXQgaT0wOyBpPHN0b3JhZ2UubGVuZ3RoOyArK2kpIHtcbiAgICBjb25zdCBrZXkgPSBzdG9yYWdlLmtleShpKVxuXG4gICAgaWYgKCFyZWdleC50ZXN0KGtleSkpXG4gICAgICBjb250aW51ZVxuXG4gICAgY29uc3QgZGF0YSA9IHRyeVBhcnNlKHN0b3JhZ2UuZ2V0SXRlbShrZXkpKVxuICAgIGlmICghc2VlbXNWYWxpZChkYXRhKSlcbiAgICAgIGNvbnRpbnVlXG5cbiAgICBpZiAoZGF0YS5leHBpcmVzIDw9IERhdGUubm93KCkpIHtcbiAgICAgIHN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpXG5cbiAgICAgIGlmICh1bnNhZmVEZWxldGVBdG9tcylcbiAgICAgICAgdW5zYWZlRGVsZXRlQXRvbSh7c3RvcmFnZSwga2V5fSlcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgKHtrZXksIHN0b3JhZ2UsIC4uLm9wdGlvbnN9KSA9PiB7XG4gIGNvbnN0IHt2YWx1ZTogZGVmYXVsdFZhbHVlLCBBdG9tLCB0aW1lLCBzY2hlbWEsIGRlYm91bmNlfSA9IG9wdGlvbnNcblxuICBjb25zdCBhdG9tcyA9IGdldEF0b21zKHN0b3JhZ2UpXG5cbiAgbGV0IGF0b20gPSBhdG9tc1trZXldXG4gIGlmICghYXRvbSkge1xuICAgIGF0b21zW2tleV0gPSBhdG9tID0gQXRvbShkZWZhdWx0VmFsdWUpO1xuICAgIGdldFZhbHVlKHN0b3JhZ2UsIGtleSwgc2NoZW1hLCBkZWZhdWx0VmFsdWUsIHRpbWUsIGF0b20pXG5cbiAgICBpZiAocHJvY2Vzcy5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIpXG4gICAgICB1c2VkT3B0aW9ucy5zZXQoYXRvbSwgb3B0aW9ucylcblxuICAgIGxldCBjaGFuZ2VzID0gYXRvbS5jaGFuZ2VzKClcbiAgICBpZiAoMCA8PSBkZWJvdW5jZSlcbiAgICAgIGNoYW5nZXMgPSBjaGFuZ2VzLmRlYm91bmNlKGRlYm91bmNlKVxuXG4gICAgY2hhbmdlcy5vblZhbHVlKHZhbHVlID0+IHtcbiAgICAgIGlmIChSLmVxdWFscyh2YWx1ZSwgZGVmYXVsdFZhbHVlKSkge1xuICAgICAgICBzdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IHt2YWx1ZX1cblxuICAgICAgICBpZiAoc2NoZW1hICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgZGF0YS5zY2hlbWEgPSBzY2hlbWFcblxuICAgICAgICBpZiAoMCA8PSB0aW1lKVxuICAgICAgICAgIGRhdGEuZXhwaXJlcyA9IHRpbWUgKyBEYXRlLm5vdygpXG5cbiAgICAgICAgc3RvcmFnZS5zZXRJdGVtKGtleSwgSlNPTi5zdHJpbmdpZnkoZGF0YSwgKGtleSwgdmFsdWUpPT57XG4gICAgICAgICAgY29uc3QgYmxhY2tsaXN0ID0gb3B0aW9ucy5ibGFja2xpc3QgfHwgW107XG4gICAgICAgICAgaWYgKGJsYWNrbGlzdC5maW5kKHggPT4geCA9PT0ga2V5KSl7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KSlcbiAgICAgIH1cbiAgICB9KVxuICB9IGVsc2UgaWYgKHByb2Nlc3MuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiKSB7XG4gICAgY29uc3Qgb2xkT3B0aW9ucyA9IHVzZWRPcHRpb25zLmdldChhdG9tKVxuICAgIGZvciAoY29uc3QgayBpbiBvcHRpb25zKSB7XG4gICAgICBpZiAoIVIuZXF1YWxzKG9wdGlvbnNba10sIG9sZE9wdGlvbnNba10pKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGF0b20uc3RvcmFnZTogQ3JlYXRlZCB0d28gYXRvbXMgd2l0aCBzYW1lIHN0b3JhZ2UgYW5kIGtleSAke3Nob3coa2V5KX0sIGJ1dCBkaWZmZXJlbnQgJHtzaG93KGspfTogZmlyc3QgJHtzaG93KG9sZE9wdGlvbnNba10pfSBhbmQgbGF0ZXIgJHtzaG93KG9wdGlvbnNba10pfS5gKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhdG9tXG59XG4iXX0=