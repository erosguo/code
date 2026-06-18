# 文件路径：main.py
from fastapi import FastAPI

# 创建 FastAPI 实例
app = FastAPI(
    title="RUNOOB 博客",
    description="用 FastAPI 构建的个人博客展示站",
    version="1.0.0"
)

@app.get("/")           # GET 请求的路由装饰器
def index():
    """首页"""
    return {"message": "欢迎来到 RUNOOB 博客"}

@app.get("/hello/{name}")   # 路径参数 {name}
def hello(name: str):       # FastAPI 根据类型提示自动校验
    return {"greeting": f"你好，{name}！"}