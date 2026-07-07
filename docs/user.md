# easy-music系统接口文档


**简介**:easy-music系统接口文档


**HOST**:http://localhost:8080


**联系人**:


**Version**:1.0


**接口路径**:/v3/api-docs/user


[TOC]






# C端-歌单相关接口


## 更新歌单信息接口


**接口地址**:`/playlist/update`


**请求方式**:`PUT`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "playlistId": 1,
  "title": "EasyMusic官方歌单",
  "introduction": "动感十足的欧美流行歌，让有氧运动更有活力~",
  "style": "欧美流行",
  "coverUrl": ""
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|playlistDTO|PlaylistDTO|body|true|PlaylistDTO|PlaylistDTO|
|&emsp;&emsp;playlistId|歌单id||true|integer(int64)||
|&emsp;&emsp;title|歌单标题||true|string||
|&emsp;&emsp;introduction|歌单简介||false|string||
|&emsp;&emsp;style|歌单风格||true|string||
|&emsp;&emsp;coverUrl|歌单封面||true|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


## 向歌单添加歌曲接口


**接口地址**:`/playlist/{playlistId}/song/{songId}`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|playlistId||path|true|integer(int64)||
|songId||path|true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


## 从歌单删除歌曲接口


**接口地址**:`/playlist/{playlistId}/song/{songId}`


**请求方式**:`DELETE`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|playlistId||path|true|integer(int64)||
|songId||path|true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


## 创建歌单接口


**接口地址**:`/playlist/create`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "playlistId": 1,
  "title": "EasyMusic官方歌单",
  "introduction": "动感十足的欧美流行歌，让有氧运动更有活力~",
  "style": "欧美流行",
  "coverUrl": ""
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|playlistDTO|PlaylistDTO|body|true|PlaylistDTO|PlaylistDTO|
|&emsp;&emsp;playlistId|歌单id||true|integer(int64)||
|&emsp;&emsp;title|歌单标题||true|string||
|&emsp;&emsp;introduction|歌单简介||false|string||
|&emsp;&emsp;style|歌单风格||true|string||
|&emsp;&emsp;coverUrl|歌单封面||true|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


## 搜索歌单接口


**接口地址**:`/playlist/search`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|text||query|true|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultPageResult|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data||PageResult|PageResult|
|&emsp;&emsp;total||integer(int64)||
|&emsp;&emsp;items||array|object|


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {
		"total": 0,
		"items": []
	}
}
```


## 获取当前用户歌单列表接口


**接口地址**:`/playlist/list`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


暂无


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultListPlaylist|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|array|Playlist|
|&emsp;&emsp;playlistId||integer(int64)||
|&emsp;&emsp;title||string||
|&emsp;&emsp;coverUrl||string||
|&emsp;&emsp;introduction||string||
|&emsp;&emsp;style||string||
|&emsp;&emsp;userId||integer(int64)||
|&emsp;&emsp;userName||string||
|&emsp;&emsp;createTime||string(date-time)||
|&emsp;&emsp;updateTime||string(date-time)||
|&emsp;&emsp;playCount||integer(int64)||
|&emsp;&emsp;isFavorite||boolean||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": [
		{
			"playlistId": 0,
			"title": "",
			"coverUrl": "",
			"introduction": "",
			"style": "",
			"userId": 0,
			"userName": "",
			"createTime": "",
			"updateTime": "",
			"playCount": 0,
			"isFavorite": true
		}
	]
}
```


## 获取用户歌单列表接口


**接口地址**:`/playlist/list/{userId}`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|userId||path|true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultListPlaylist|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|array|Playlist|
|&emsp;&emsp;playlistId||integer(int64)||
|&emsp;&emsp;title||string||
|&emsp;&emsp;coverUrl||string||
|&emsp;&emsp;introduction||string||
|&emsp;&emsp;style||string||
|&emsp;&emsp;userId||integer(int64)||
|&emsp;&emsp;userName||string||
|&emsp;&emsp;createTime||string(date-time)||
|&emsp;&emsp;updateTime||string(date-time)||
|&emsp;&emsp;playCount||integer(int64)||
|&emsp;&emsp;isFavorite||boolean||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": [
		{
			"playlistId": 0,
			"title": "",
			"coverUrl": "",
			"introduction": "",
			"style": "",
			"userId": 0,
			"userName": "",
			"createTime": "",
			"updateTime": "",
			"playCount": 0,
			"isFavorite": true
		}
	]
}
```


## 删除歌单接口


**接口地址**:`/playlist/{playlistId}`


**请求方式**:`DELETE`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|playlistId||path|true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


# C端-用户相关接口


## 更新用户密码接口


**接口地址**:`/password`


**请求方式**:`PUT`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "email": "2199791686@qq.com",
  "verificationCode": "123456",
  "newPassword": "",
  "repeatPassword": ""
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|userResetPasswordDTO|UserResetPasswordDTO|body|true|UserResetPasswordDTO|UserResetPasswordDTO|
|&emsp;&emsp;email|用户邮箱||true|string||
|&emsp;&emsp;verificationCode|验证码||true|string||
|&emsp;&emsp;newPassword|||true|string||
|&emsp;&emsp;repeatPassword|||true|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


## 获取用户信息接口


**接口地址**:`/me`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


暂无


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultUserVO|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data||UserVO|UserVO|
|&emsp;&emsp;userId||integer(int64)||
|&emsp;&emsp;username||string||
|&emsp;&emsp;phone||string||
|&emsp;&emsp;email||string||
|&emsp;&emsp;userAvatar||string||
|&emsp;&emsp;introduction||string||
|&emsp;&emsp;artistId||integer(int64)||
|&emsp;&emsp;favoriteSongCount||integer(int32)||
|&emsp;&emsp;favoritePlaylistCount||integer(int32)||
|&emsp;&emsp;followCount||integer(int64)||
|&emsp;&emsp;fansCount||integer(int64)||
|&emsp;&emsp;visitorCount||integer(int64)||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {
		"userId": 0,
		"username": "",
		"phone": "",
		"email": "",
		"userAvatar": "",
		"introduction": "",
		"artistId": 0,
		"favoriteSongCount": 0,
		"favoritePlaylistCount": 0,
		"followCount": 0,
		"fansCount": 0,
		"visitorCount": 0
	}
}
```


## 更新用户基本信息接口


**接口地址**:`/me`


**请求方式**:`PUT`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "userId": 0,
  "username": "",
  "phone": "",
  "email": "",
  "introduction": ""
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|userDTO|UserDTO|body|true|UserDTO|UserDTO|
|&emsp;&emsp;userId|||false|integer(int64)||
|&emsp;&emsp;username|||true|string||
|&emsp;&emsp;phone|||false|string||
|&emsp;&emsp;email|||true|string||
|&emsp;&emsp;introduction|||false|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


## 更新用户邮箱接口


**接口地址**:`/email`


**请求方式**:`PUT`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "newEmail": "480395924@qq.com",
  "verificationCode": "123456"
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|userEmailUpdateDTO|UserEmailUpdateDTO|body|true|UserEmailUpdateDTO|UserEmailUpdateDTO|
|&emsp;&emsp;newEmail|用户邮箱||false|string||
|&emsp;&emsp;verificationCode|验证码||true|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


## 用户注册接口


**接口地址**:`/register`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "username": "user_01",
  "password": "12345678",
  "email": "2199791686@qq.com",
  "verificationCode": "123456"
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|userRegisterDTO|UserRegisterDTO|body|true|UserRegisterDTO|UserRegisterDTO|
|&emsp;&emsp;username|用户名||true|string||
|&emsp;&emsp;password|用户密码||true|string||
|&emsp;&emsp;email|用户邮箱||true|string||
|&emsp;&emsp;verificationCode|验证码||true|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


## 用户登出接口


**接口地址**:`/logout`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


暂无


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


## 用户密码登录接口


**接口地址**:`/login/password`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "username": "user_01",
  "password": "12345678"
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|userPasswordLoginDTO|UserPasswordLoginDTO|body|true|UserPasswordLoginDTO|UserPasswordLoginDTO|
|&emsp;&emsp;username|用户名||true|string||
|&emsp;&emsp;password|用户密码||true|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


## 用户邮箱登录接口


**接口地址**:`/login/email`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "email": "2199791686@qq.com",
  "verificationCode": "123456"
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|userEmailLoginDTO|UserEmailLoginDTO|body|true|UserEmailLoginDTO|UserEmailLoginDTO|
|&emsp;&emsp;email|用户邮箱||true|string||
|&emsp;&emsp;verificationCode|验证码||true|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


## 用户忘记密码接口


**接口地址**:`/password/reset`


**请求方式**:`PATCH`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "email": "2199791686@qq.com",
  "verificationCode": "123456",
  "newPassword": "",
  "repeatPassword": ""
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|userResetPasswordDTO|UserResetPasswordDTO|body|true|UserResetPasswordDTO|UserResetPasswordDTO|
|&emsp;&emsp;email|用户邮箱||true|string||
|&emsp;&emsp;verificationCode|验证码||true|string||
|&emsp;&emsp;newPassword|||true|string||
|&emsp;&emsp;repeatPassword|||true|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


## 更新用户头像接口


**接口地址**:`/avatar`


**请求方式**:`PATCH`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|avatar||query|true|file||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


## 发送验证码接口


**接口地址**:`/code/{optionType}/{email}`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|email||path|true|string||
|optionType||path|true|integer(int32)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


## 用户注销接口


**接口地址**:`/account`


**请求方式**:`DELETE`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|Authorization||header|true|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


# C端-歌曲相关接口


## 搜索歌曲接口


**接口地址**:`/song/search`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


暂无


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultPageResult|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data||PageResult|PageResult|
|&emsp;&emsp;total||integer(int64)||
|&emsp;&emsp;items||array|object|


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {
		"total": 0,
		"items": []
	}
}
```


## 用户听歌接口


**接口地址**:`/song/listen/{songId}`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|songId||path|true|integer(int64)||
|playListId||query|false|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


## 根据id获取歌曲接口


**接口地址**:`/song/{id}`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|id||path|true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultSong|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data||Song|Song|
|&emsp;&emsp;songId||integer(int64)||
|&emsp;&emsp;artistId||integer(int64)||
|&emsp;&emsp;songName||string||
|&emsp;&emsp;artistName||string||
|&emsp;&emsp;album||string||
|&emsp;&emsp;lyrics||string||
|&emsp;&emsp;lyricsHead||string||
|&emsp;&emsp;lyricsSegment||string||
|&emsp;&emsp;nested||string||
|&emsp;&emsp;duration||string||
|&emsp;&emsp;style||string||
|&emsp;&emsp;coverUrl||string||
|&emsp;&emsp;audioUrl||string||
|&emsp;&emsp;releaseTime||string(date)||
|&emsp;&emsp;favoriteCount||integer(int64)||
|&emsp;&emsp;playCount||integer(int64)||
|&emsp;&emsp;isFavorite||boolean||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {
		"songId": 0,
		"artistId": 0,
		"songName": "",
		"artistName": "",
		"album": "",
		"lyrics": "",
		"lyricsHead": "",
		"lyricsSegment": "",
		"nested": "",
		"duration": "",
		"style": "",
		"coverUrl": "",
		"audioUrl": "",
		"releaseTime": "",
		"favoriteCount": 0,
		"playCount": 0,
		"isFavorite": true
	}
}
```


## 获取周榜Top200歌曲接口


**接口地址**:`/song/top200/week`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|offset||query|true|integer(int32)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultListSong|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|array|Song|
|&emsp;&emsp;songId||integer(int64)||
|&emsp;&emsp;artistId||integer(int64)||
|&emsp;&emsp;songName||string||
|&emsp;&emsp;artistName||string||
|&emsp;&emsp;album||string||
|&emsp;&emsp;lyrics||string||
|&emsp;&emsp;lyricsHead||string||
|&emsp;&emsp;lyricsSegment||string||
|&emsp;&emsp;nested||string||
|&emsp;&emsp;duration||string||
|&emsp;&emsp;style||string||
|&emsp;&emsp;coverUrl||string||
|&emsp;&emsp;audioUrl||string||
|&emsp;&emsp;releaseTime||string(date)||
|&emsp;&emsp;favoriteCount||integer(int64)||
|&emsp;&emsp;playCount||integer(int64)||
|&emsp;&emsp;isFavorite||boolean||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": [
		{
			"songId": 0,
			"artistId": 0,
			"songName": "",
			"artistName": "",
			"album": "",
			"lyrics": "",
			"lyricsHead": "",
			"lyricsSegment": "",
			"nested": "",
			"duration": "",
			"style": "",
			"coverUrl": "",
			"audioUrl": "",
			"releaseTime": "",
			"favoriteCount": 0,
			"playCount": 0,
			"isFavorite": true
		}
	]
}
```


## 获取月榜Top200歌曲接口


**接口地址**:`/song/top200/month`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|offset||query|true|integer(int32)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Song|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|songId||integer(int64)|integer(int64)|
|artistId||integer(int64)|integer(int64)|
|songName||string||
|artistName||string||
|album||string||
|lyrics||string||
|lyricsHead||string||
|lyricsSegment||string||
|nested||string||
|duration||string||
|style||string||
|coverUrl||string||
|audioUrl||string||
|releaseTime||string(date)|string(date)|
|favoriteCount||integer(int64)|integer(int64)|
|playCount||integer(int64)|integer(int64)|
|isFavorite||boolean||


**响应示例**:
```javascript
[
	{
		"songId": 0,
		"artistId": 0,
		"songName": "",
		"artistName": "",
		"album": "",
		"lyrics": "",
		"lyricsHead": "",
		"lyricsSegment": "",
		"nested": "",
		"duration": "",
		"style": "",
		"coverUrl": "",
		"audioUrl": "",
		"releaseTime": "",
		"favoriteCount": 0,
		"playCount": 0,
		"isFavorite": true
	}
]
```


## 获取推荐歌曲接口


**接口地址**:`/song/recommend`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


暂无


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultListSong|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|array|Song|
|&emsp;&emsp;songId||integer(int64)||
|&emsp;&emsp;artistId||integer(int64)||
|&emsp;&emsp;songName||string||
|&emsp;&emsp;artistName||string||
|&emsp;&emsp;album||string||
|&emsp;&emsp;lyrics||string||
|&emsp;&emsp;lyricsHead||string||
|&emsp;&emsp;lyricsSegment||string||
|&emsp;&emsp;nested||string||
|&emsp;&emsp;duration||string||
|&emsp;&emsp;style||string||
|&emsp;&emsp;coverUrl||string||
|&emsp;&emsp;audioUrl||string||
|&emsp;&emsp;releaseTime||string(date)||
|&emsp;&emsp;favoriteCount||integer(int64)||
|&emsp;&emsp;playCount||integer(int64)||
|&emsp;&emsp;isFavorite||boolean||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": [
		{
			"songId": 0,
			"artistId": 0,
			"songName": "",
			"artistName": "",
			"album": "",
			"lyrics": "",
			"lyricsHead": "",
			"lyricsSegment": "",
			"nested": "",
			"duration": "",
			"style": "",
			"coverUrl": "",
			"audioUrl": "",
			"releaseTime": "",
			"favoriteCount": 0,
			"playCount": 0,
			"isFavorite": true
		}
	]
}
```


## 获取歌单歌曲内容


**接口地址**:`/song/playlist/{playlistId}`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|playlistId||path|true|integer(int64)||
|pageQueryDTO||query|true|PageQueryDTO|PageQueryDTO|
|&emsp;&emsp;pageNum|页码||true|integer(int32)||
|&emsp;&emsp;pageSize|每页数量||true|integer(int32)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultPageResult|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data||PageResult|PageResult|
|&emsp;&emsp;total||integer(int64)||
|&emsp;&emsp;items||array|object|


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {
		"total": 0,
		"items": []
	}
}
```


# C端-音乐歌房接口


## 创建歌房


**接口地址**:`/room/create`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "roomId": 1001,
  "roomName": "听歌",
  "creatorId": 10086,
  "roomStatus": 1,
  "maxUsers": 20
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|roomDTO|歌房信息DTO|body|true|RoomDTO|RoomDTO|
|&emsp;&emsp;roomId|歌房ID||true|integer(int64)||
|&emsp;&emsp;roomName|歌房名称||true|string||
|&emsp;&emsp;creatorId|创建者ID||true|integer(int64)||
|&emsp;&emsp;roomStatus|歌房状态：0-关闭，1-正常,可用值:0,1||true|integer(int32)||
|&emsp;&emsp;maxUsers|最大人数||true|integer(int32)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultRoom|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data||Room|Room|
|&emsp;&emsp;roomId||integer(int64)||
|&emsp;&emsp;roomName||string||
|&emsp;&emsp;creatorId||integer(int64)||
|&emsp;&emsp;creatorNickname||string||
|&emsp;&emsp;creatorAvatar||string||
|&emsp;&emsp;roomStatus||integer(int32)||
|&emsp;&emsp;maxUsers||integer(int32)||
|&emsp;&emsp;onlineCount|当前在线人数|integer(int32)||
|&emsp;&emsp;createTime||string(date-time)||
|&emsp;&emsp;closeTime||string(date-time)||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {
		"roomId": 0,
		"roomName": "",
		"creatorId": 0,
		"creatorNickname": "",
		"creatorAvatar": "",
		"roomStatus": 0,
		"maxUsers": 0,
		"onlineCount": 5,
		"createTime": "",
		"closeTime": ""
	}
}
```


## 获取活跃歌房列表


**接口地址**:`/room/list`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


暂无


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultListRoom|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|array|Room|
|&emsp;&emsp;roomId||integer(int64)||
|&emsp;&emsp;roomName||string||
|&emsp;&emsp;creatorId||integer(int64)||
|&emsp;&emsp;creatorNickname||string||
|&emsp;&emsp;creatorAvatar||string||
|&emsp;&emsp;roomStatus||integer(int32)||
|&emsp;&emsp;maxUsers||integer(int32)||
|&emsp;&emsp;onlineCount|当前在线人数|integer(int32)||
|&emsp;&emsp;createTime||string(date-time)||
|&emsp;&emsp;closeTime||string(date-time)||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": [
		{
			"roomId": 0,
			"roomName": "",
			"creatorId": 0,
			"creatorNickname": "",
			"creatorAvatar": "",
			"roomStatus": 0,
			"maxUsers": 0,
			"onlineCount": 5,
			"createTime": "",
			"closeTime": ""
		}
	]
}
```


## 获取最近20条聊天记录


**接口地址**:`/room/chat`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|roomId||query|true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultListChatMessage|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|array|ChatMessage|
|&emsp;&emsp;userId||integer(int64)||
|&emsp;&emsp;nickname||string||
|&emsp;&emsp;avatar||string||
|&emsp;&emsp;content||string||
|&emsp;&emsp;createTime||string||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": [
		{
			"userId": 0,
			"nickname": "",
			"avatar": "",
			"content": "",
			"createTime": ""
		}
	]
}
```


# C端-用户收藏相关接口


## 获取用户收藏歌曲


**接口地址**:`/favorite/songs`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "pageNum": 1,
  "pageSize": 10
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|pageQueryDTO|PageQueryDTO|body|true|PageQueryDTO|PageQueryDTO|
|&emsp;&emsp;pageNum|页码||true|integer(int32)||
|&emsp;&emsp;pageSize|每页数量||true|integer(int32)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultPageResult|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data||PageResult|PageResult|
|&emsp;&emsp;total||integer(int64)||
|&emsp;&emsp;items||array|object|


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {
		"total": 0,
		"items": []
	}
}
```


## 收藏歌曲


**接口地址**:`/favorite/songs/{songId}`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|songId||path|true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


## 取消收藏歌曲


**接口地址**:`/favorite/songs/{songId}`


**请求方式**:`DELETE`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|songId||path|true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


## 获取用户收藏歌单


**接口地址**:`/favorite/playlists`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "pageNum": 1,
  "pageSize": 10
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|pageQueryDTO|PageQueryDTO|body|true|PageQueryDTO|PageQueryDTO|
|&emsp;&emsp;pageNum|页码||true|integer(int32)||
|&emsp;&emsp;pageSize|每页数量||true|integer(int32)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultPageResult|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data||PageResult|PageResult|
|&emsp;&emsp;total||integer(int64)||
|&emsp;&emsp;items||array|object|


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {
		"total": 0,
		"items": []
	}
}
```


## 收藏歌单


**接口地址**:`/favorite/playlists/{playlistId}`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|playlistId||path|true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


## 取消收藏歌单


**接口地址**:`/favorite/playlists/{playlistId}`


**请求方式**:`DELETE`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|playlistId||query|true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


# C端-评论相关接口


## 添加歌曲评论接口


**接口地址**:`/comment/song/{songId}/add`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "commentId": 1001,
  "content": "这首歌太好听了！",
  "parentId": 0,
  "rootId": 1001
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|songId||path|true|integer(int64)||
|commentDTO|评论数据传输对象|body|true|CommentDTO|CommentDTO|
|&emsp;&emsp;commentId|评论ID||true|integer(int64)||
|&emsp;&emsp;content|评论内容||true|string||
|&emsp;&emsp;parentId|父级评论ID（0表示一级评论）||true|integer(int64)||
|&emsp;&emsp;rootId|根评论ID（0或null表示一级评论）||true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


## 添加歌单评论接口


**接口地址**:`/comment/playlist/{playlistId}/add`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "commentId": 1001,
  "content": "这首歌太好听了！",
  "parentId": 0,
  "rootId": 1001
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|playlistId||path|true|integer(int64)||
|commentDTO|评论数据传输对象|body|true|CommentDTO|CommentDTO|
|&emsp;&emsp;commentId|评论ID||true|integer(int64)||
|&emsp;&emsp;content|评论内容||true|string||
|&emsp;&emsp;parentId|父级评论ID（0表示一级评论）||true|integer(int64)||
|&emsp;&emsp;rootId|根评论ID（0或null表示一级评论）||true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


## 点赞-取消点赞评论接口


**接口地址**:`/comment/like/{commentId}`


**请求方式**:`PATCH`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|commentId||path|true|integer(int64)||
|likeStatus||query|true|integer(int32)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


## 歌曲评论的分页查询接口


**接口地址**:`/comment/song/{songId}/list`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|songId||path|true|integer(int64)||
|queryDTO||query|true|CommentScrollQueryDTO|CommentScrollQueryDTO|
|&emsp;&emsp;rootId|根评论ID||true|integer(int64)||
|&emsp;&emsp;firstId|滚动分页查询的起始ID（第一次查询传0或最大值，后续传上一页最后一条记录的ID）||true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultScrollResult|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data||ScrollResult|ScrollResult|
|&emsp;&emsp;list||array|object|
|&emsp;&emsp;lastId||integer(int64)||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {
		"list": [],
		"lastId": 0
	}
}
```


## 歌单评论的分页查询接口


**接口地址**:`/comment/playlist/{playlistId}/list`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|playlistId||path|true|integer(int64)||
|queryDTO||query|true|CommentScrollQueryDTO|CommentScrollQueryDTO|
|&emsp;&emsp;rootId|根评论ID||true|integer(int64)||
|&emsp;&emsp;firstId|滚动分页查询的起始ID（第一次查询传0或最大值，后续传上一页最后一条记录的ID）||true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultScrollResult|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data||ScrollResult|ScrollResult|
|&emsp;&emsp;list||array|object|
|&emsp;&emsp;lastId||integer(int64)||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {
		"list": [],
		"lastId": 0
	}
}
```


## 删除评论接口


**接口地址**:`/comment/{commentId}`


**请求方式**:`DELETE`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|commentId||path|true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


# C端-歌手相关接口


## 歌手分页查询


**接口地址**:`/artist/page`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "pageNum": 1,
  "pageSize": 10,
  "artistId": 1,
  "artistName": "周杰伦",
  "gender": 0,
  "area": "中国台湾",
  "status": 0
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|artistPageQueryDTO|歌手查询请求参数|body|true|ArtistPageQueryDTO|ArtistPageQueryDTO|
|&emsp;&emsp;pageNum|页码||true|integer(int32)||
|&emsp;&emsp;pageSize|每页数量||true|integer(int32)||
|&emsp;&emsp;artistId|歌手id||false|integer(int64)||
|&emsp;&emsp;artistName|歌手姓名（支持模糊查询）||false|string||
|&emsp;&emsp;gender|歌手性别（0-男，1-女）,可用值:0,1||false|integer(int32)||
|&emsp;&emsp;area|歌手所处地区（支持模糊查询）||false|string||
|&emsp;&emsp;status|0-未认证 1-待审核，2-已认证||false|integer(int32)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultPageResult|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data||PageResult|PageResult|
|&emsp;&emsp;total||integer(int64)||
|&emsp;&emsp;items||array|object|


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {
		"total": 0,
		"items": []
	}
}
```


## 歌手认证接口


**接口地址**:`/artist/certify`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|artistId||query|true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


## 添加歌曲（歌手认证后才能添加）


**接口地址**:`/artist/add`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "songId": 1,
  "artistId": 1,
  "songName": "晴天",
  "album": "叶惠美",
  "lyrics": "故事的小黄花,从出生那年就飘着,童年的荡秋千,随记忆一直晃到现在,Re So So Si Do Si La,So La Si Si Si Si La Si La So,吹着前奏望着天空,我想起花瓣试着掉落,为你翘课的那一天,花落的那一天,教室的那一间,我怎么看不见,消失的下雨天,我好想再淋一遍,没想到失去的勇气我还留着,好想再问一遍,你会等待还是离开,刮风这天我试过握着你手,但偏偏雨渐渐大到我看你不见,还要多久我才能在你身边,等到放晴的那天也许我会比较好一点,从前从前有个人爱你很久,但偏偏风渐渐把距离吹得好远,好不容易又能再多爱一天,但故事的最后你好像还是说了拜拜,为你翘课的那一天,花落的那一天,教室的那一间,我怎么看不见,消失的下雨天,我好想再淋一遍,没想到失去的勇气我还留着,好想再问一遍,你会等待还是离开,刮风这天我试过握着你手,但偏偏雨渐渐大到我看你不见,还要多久我才能在你身边,等到放晴的那天也许我会比较好一点,从前从前有个人爱你很久,偏偏风渐渐把距离吹得好远,好不容易又能再多爱一天,但故事的最后你好像还是说了拜拜,刮风这天我试过握着你手,但偏偏雨渐渐大到我看你不见,还要多久我才能够在你身边,等到放晴那天也许我会比较好一点,从前从前有个人爱你很久,但偏偏雨渐渐把距离吹得好远,好不容易又能再多爱一天,但故事的最后你好像还是说了拜",
  "style": "流行音乐",
  "releaseTime": "2003-07-31",
  "duration": "120"
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|songDTO|SongDTO|body|true|SongDTO|SongDTO|
|&emsp;&emsp;songId|歌曲id||true|integer(int64)||
|&emsp;&emsp;artistId|歌手id||false|integer(int64)||
|&emsp;&emsp;songName|歌曲名称||true|string||
|&emsp;&emsp;album|专辑名称||false|string||
|&emsp;&emsp;lyrics|歌词||false|string||
|&emsp;&emsp;style|歌曲风格||false|string||
|&emsp;&emsp;releaseTime|歌曲发行时间||false|string(date)||
|&emsp;&emsp;duration|歌曲时长||true|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


## 根据ID获取歌手详情


**接口地址**:`/artist/{artistId}`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|artistId||path|true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultArtist|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data||Artist|Artist|
|&emsp;&emsp;artistId||integer(int64)||
|&emsp;&emsp;artistName||string||
|&emsp;&emsp;gender||integer(int32)||
|&emsp;&emsp;avatar||string||
|&emsp;&emsp;birth||string(date)||
|&emsp;&emsp;area||string||
|&emsp;&emsp;introduction||string||
|&emsp;&emsp;userId||integer(int64)||
|&emsp;&emsp;status||integer(int32)||
|&emsp;&emsp;createTime||string(date-time)||
|&emsp;&emsp;updateTime||string(date-time)||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {
		"artistId": 0,
		"artistName": "",
		"gender": 0,
		"avatar": "",
		"birth": "",
		"area": "",
		"introduction": "",
		"userId": 0,
		"status": 0,
		"createTime": "",
		"updateTime": ""
	}
}
```


# C端-播放记录相关接口


## 获取用户播放记录接口


**接口地址**:`/record/list`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|pageQueryDTO||query|true|PageQueryDTO|PageQueryDTO|
|&emsp;&emsp;pageNum|页码||true|integer(int32)||
|&emsp;&emsp;pageSize|每页数量||true|integer(int32)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultListSong|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|array|Song|
|&emsp;&emsp;songId||integer(int64)||
|&emsp;&emsp;artistId||integer(int64)||
|&emsp;&emsp;songName||string||
|&emsp;&emsp;artistName||string||
|&emsp;&emsp;album||string||
|&emsp;&emsp;lyrics||string||
|&emsp;&emsp;lyricsHead||string||
|&emsp;&emsp;lyricsSegment||string||
|&emsp;&emsp;nested||string||
|&emsp;&emsp;duration||string||
|&emsp;&emsp;style||string||
|&emsp;&emsp;coverUrl||string||
|&emsp;&emsp;audioUrl||string||
|&emsp;&emsp;releaseTime||string(date)||
|&emsp;&emsp;favoriteCount||integer(int64)||
|&emsp;&emsp;playCount||integer(int64)||
|&emsp;&emsp;isFavorite||boolean||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": [
		{
			"songId": 0,
			"artistId": 0,
			"songName": "",
			"artistName": "",
			"album": "",
			"lyrics": "",
			"lyricsHead": "",
			"lyricsSegment": "",
			"nested": "",
			"duration": "",
			"style": "",
			"coverUrl": "",
			"audioUrl": "",
			"releaseTime": "",
			"favoriteCount": 0,
			"playCount": 0,
			"isFavorite": true
		}
	]
}
```


## 删除用户播放记录接口


**接口地址**:`/record/delete/{songId}`


**请求方式**:`DELETE`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|songId||path|true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|Result|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|object||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": {}
}
```


# C端-轮播图接口


## 获取轮播图列表接口


**接口地址**:`/banner/list`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


暂无


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultListBanner|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code|状态码|integer(int32)|integer(int32)|
|message|提示信息|string||
|data|数据|array|Banner|
|&emsp;&emsp;bannerId||integer(int64)||
|&emsp;&emsp;bannerUrl||string||
|&emsp;&emsp;bannerStatus||integer(int32)||


**响应示例**:
```javascript
{
	"code": 0,
	"message": "",
	"data": [
		{
			"bannerId": 0,
			"bannerUrl": "",
			"bannerStatus": 0
		}
	]
}
```