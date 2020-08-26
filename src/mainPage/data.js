var data = require('./mapping');

data.items = data.items
    .sort(function (a, b) {
        if (a.id < b.id) {
            return -1;
        }

        if (a.id > b.id) {
            return 1;
        }

        return 0;
    }).map(function (item) {
        if (!item.tags || !item.tags.length) {
            item.tags = [{ title: 'untagged', color: data.colors.untagged }]
        }

        return item;
    });

var taggedData = data.items.reduce(function (result, item) {
    if (item.tags) {
        item.tags.forEach(function (tag) {
            if (!result[tag.title]) {
                result[tag.title] = {
                    color: tag.color,
                    items: []
                }
            }

            result[tag.title].items = [].concat(result[tag.title].items, [item]);
        });
    } else {
        if (!result.untagged) {
            result.untagged = {
                color: data.COLORS.untagged,
                items: []
            }
        }

        result.untagged.items = [].concat(result.untagged.items, [item]);
    }

    return result;
}, {});

module.exports = {
    getRawData: data.items,
    getByTags: taggedData
};
