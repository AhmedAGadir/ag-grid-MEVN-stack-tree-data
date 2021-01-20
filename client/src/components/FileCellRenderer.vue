<template>
  <div>
    <span>
      <i :class="iconClass"></i>
      <span class="filename"></span>
      {{ params.data.folder }}
    </span>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      iconClass: "",
    };
  },
  beforeMount() {
    this.iconClass = this.getFileIcon(this.params.data);
  },
  methods: {
    getFileIcon(data) {
      return data.isGroup
        ? "far fa-folder"
        : this.endsWith(data.folder, ".mp3") ||
          this.endsWith(data.folder, ".wav")
        ? "far fa-file-audio"
        : this.endsWith(data.folder, ".xls")
        ? "far fa-file-excel"
        : this.endsWith(data.folder, ".txt")
        ? "far fa-file"
        : this.endsWith(data.folder, ".pdf")
        ? "far fa-file-pdf"
        : "";
    },
    endsWith(str, match) {
      var len;
      if (str == null || !str.length || match == null || !match.length) {
        return false;
      }
      len = str.length;
      return str.substring(len - match.length, len) === match;
    },
  },
};
</script>

<style lang="scss" scoped>
// @import "../scss/_variables.scss";
.fa-folder {
  color: darkorange;
}

.fa-file-pdf {
  color: red;
}

.fa-file-excel {
  color: green;
}

.fa-file-audio {
  color: blue;
}

.filename {
  padding: 5px;
  color: black;
  font-size: 16px;
}
</style>
