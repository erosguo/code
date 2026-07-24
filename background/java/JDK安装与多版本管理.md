# JDK 安装与多版本管理（Windows）

## 如何获取 JDK

| 发行版 | 地址 | 特点 |
|--------|------|------|
| **Oracle JDK** | https://www.oracle.com/java/technologies/downloads/ | 官方版，个人/开发免费，商用需订阅 |
| **Eclipse Temurin (Adoptium)** | https://adoptium.net/temurin/releases/ | 开源社区版，最流行，推荐 |
| **Amazon Corretto** | https://docs.aws.amazon.com/corretto/ | AWS 维护，免费长期支持 |
| **Azul Zulu** | https://www.azul.com/downloads/ | 高性能，企业支持好 |
| **Microsoft OpenJDK** | https://www.microsoft.com/openjdk | Microsoft 维护 |

## 安装 JDK

1. 下载所需版本的 `.msi` 或 `.zip`（推荐 `.zip` 更灵活）
2. 创建统一目录（若不存在）：
   ```cmd
   md "D:\Program Files\Java"
   ```
3. 解压或安装到该目录，如：
   ```
   D:\Program Files\Java\jdk-17
   D:\Program Files\Java\jdk-21
   D:\Program Files\Java\jdk-25
   ```

## 手动管理多版本（通过环境变量）

### 原理

- `JAVA_HOME` 指向当前要用的 JDK 目录
- `PATH` 中包含 `%JAVA_HOME%\bin`

### 设置步骤

1. 打开 **系统属性 → 高级 → 环境变量**
2. **系统变量** 中新建 `JAVA_HOME`，值为 JDK 路径，如 `D:\Program Files\Java\jdk-21`
3. **系统变量** `Path` 中新增 `%JAVA_HOME%\bin`
4. 确保 `%JAVA_HOME%\bin` 排在 `C:\Program Files\Common Files\Oracle\Java\javapath` **之前**

### 切换版本

**临时切换（当前命令行窗口）：**
```cmd
set "JAVA_HOME=D:\Program Files\Java\jdk-17"
set "Path=%JAVA_HOME%\bin;%Path%"
java -version
```

**永久切换：**
```cmd
setx JAVA_HOME "D:\Program Files\Java\jdk-21" /m
```
> 需管理员权限，重启命令行生效。

### 验证

```cmd
java -version
javac -version
echo %JAVA_HOME%
```

## 建议

- 推荐用 **Eclipse Temurin** 作为日常开发版本
- 新项目选 **Java 21**，存量项目多停留在 **Java 17**
- 可用 [jv](https://github.com/CostaBrosky/jv) 等工具简化切换
